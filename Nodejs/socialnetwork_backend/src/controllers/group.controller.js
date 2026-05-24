const Group = require('../models/group.model');
const Conversation = require('../models/message.model').Conversation;
const mongoose = require('mongoose');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { cloudinary } = require('../config/cloudinary');

const checkFriendship = async (userId1, userId2) => {
    return true;
};

const createGroup = async (req, res) => {
    try {
        const { name, members, description, avatar } = req.body;
        const adminId = req.userId;

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Thiếu tên nhóm' });
        }
        if (!members || !Array.isArray(members) || members.length < 2) {
            return res.status(400).json({ 
                message: 'Nhóm cần ít nhất 3 người (bao gồm bạn)' 
            });
        }

        for (const memberId of members) {
            if (memberId === adminId) continue;
            const isFriend = await checkFriendship(adminId, memberId);
            if (!isFriend) {
                return res.status(403).json({ 
                    message: 'Bạn chưa kết bạn với một số thành viên' 
                });
            }
        }

        let inviteCode;
        let exists = true;
        while (exists) {
            inviteCode = crypto.randomBytes(4).toString('hex');
            exists = await Group.findOne({ inviteCode });
        }

        const newGroup = new Group({
            name: name.trim(),
            description: description?.trim() || '',
            avatar: avatar || '',
            admin: adminId,
            members: [adminId, ...members],
            inviteCode,
            isGroup: true
        });

        const savedGroup = await newGroup.save();

        const qrDataUrl = await QRCode.toDataURL(
            `${process.env.APP_URL}/join-group/${inviteCode}`
        );

        const qrUploadResponse = await cloudinary.uploader.upload(qrDataUrl, {
            folder: 'socialnetwork/qrcodes',
            public_id: `group_${savedGroup._id}_qr`
        });

        savedGroup.qrCode = qrUploadResponse.secure_url;
        await savedGroup.save();

        await savedGroup.populate('members', 'username avatar email');
        await savedGroup.populate('admin', 'username avatar email');

        const newConv = new Conversation({
            isGroup: true,
            name: savedGroup.name,
            avatar: savedGroup.avatar,
            members: savedGroup.members.map(m => m._id),
            admin: savedGroup.admin,
            meta: { groupId: savedGroup._id }
        });
        await newConv.save();

        res.status(201).json({ 
            message: 'Tạo nhóm thành công', 
            group: savedGroup,
            conversationId: newConv._id
        });

    } catch (error) {
        console.error('Lỗi createGroup:', error);
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

const getGroups = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 50, skip = 0 } = req.query;
        
        const groups = await Group.find({ members: userId })
            .populate('members', '-password')
            .populate('admin', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean();
            
        const onlineUsers = require('../socket').getOnlineUsers();
        const enriched = groups.map(group => {
            const validMembers = (group.members || []).filter(member => member != null);
            return {
                ...group,
                members: validMembers.map(member => ({
                    ...member,
                    isOnline: onlineUsers.has(member._id?.toString())
                })),
                isAdmin: group.admin?._id?.toString() === userId
            };
        });
            
        res.json({
            success: true,
            data: enriched,
            total: await Group.countDocuments({ members: userId })
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;
        
        const group = await Group.findById(groupId)
            .populate('members', '-password')
            .populate('admin', 'username avatar')
            .lean();
            
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        const validMembers = (group.members || []).filter(member => member != null);
        if (!validMembers.some(m => m._id?.toString() === userId)) {
            return res.status(403).json({ message: 'Bạn không phải thành viên nhóm này' });
        }
        
        const onlineUsers = require('../socket').getOnlineUsers();
        group.members = validMembers.map(member => ({
            ...member,
            isOnline: onlineUsers.has(member._id?.toString())
        }));
        group.isAdmin = group.admin?._id?.toString() === userId;

        const { Post } = require('../models/content.model');
        const postCount = await Post.countDocuments({ group: groupId, postType: 'group' });
        group.postCount = postCount;
        
        res.json({ success: true, data: group });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ error: error.message });
    }
};

const joinByQR = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.userId;

        if (!inviteCode) {
            return res.status(400).json({ message: 'Thiếu mã mời' });
        }

        const group = await Group.findOne({ inviteCode });
        if (!group) {
            return res.status(404).json({ message: 'Mã QR không hợp lệ' });
        }

        if (group.members.some(m => m.toString() === userId)) {
            return res.status(400).json({ message: 'Bạn đã ở trong nhóm này' });
        }

        group.members.push(userId);
        await group.save();

        let conv = await Conversation.findOne({
            isGroup: true,
            'meta.groupId': group._id
        });
        
        if (!conv) {
            conv = new Conversation({
                isGroup: true,
                name: group.name,
                avatar: group.avatar,
                members: group.members,
                admin: group.admin,
                meta: { groupId: group._id }
            });
            await conv.save();
        } else if (!conv.members.some(m => m.toString() === userId)) {
            conv.members.push(userId);
            await conv.save();
        }

        try {
            const io = require('../socket').getIO();
            const newUser = await require('../models/account.model')
                .findById(userId)
                .select('username avatar email');
                
            io.to(group._id.toString()).emit('member_joined', { 
                groupId: group._id,
                user: newUser,
                conversationId: conv._id
            });
        } catch (e) { /* ignore socket errors */ }

        res.json({ 
            message: 'Tham gia thành công', 
            group,
            conversationId: conv._id
        });
    } catch (error) {
        console.error('Join by QR error:', error);
        res.status(500).json({ error: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { members } = req.body;
        const adminId = req.userId;

        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'Thiếu danh sách thành viên' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ message: 'Chỉ admin mới được thêm người' });
        }

        const existingIds = group.members.map(m => m.toString());
        const toAdd = members
            .filter(id => !existingIds.includes(id.toString()))
            .map(id => new mongoose.Types.ObjectId(id));

        if (toAdd.length === 0) {
            return res.status(400).json({ message: 'Tất cả thành viên đã có trong nhóm' });
        }

        group.members.push(...toAdd);
        await group.save();

        const conv = await Conversation.findOne({ 
            isGroup: true, 
            'meta.groupId': groupId 
        });
        
        if (conv) {
            for (const memberId of toAdd) {
                if (!conv.members.some(m => m.toString() === memberId.toString())) {
                    conv.members.push(memberId);
                }
            }
            await conv.save();
        }

        try {
            const io = require('../socket').getIO();
            const newUsers = await require('../models/account.model')
                .find({ _id: { $in: toAdd } })
                .select('username avatar email');
                
            io.to(groupId).emit('members_added', { 
                groupId,
                users: newUsers,
                conversationId: conv?._id
            });
        } catch (e) { /* ignore */ }

        res.json({ 
            message: `Đã thêm ${toAdd.length} thành viên`, 
            group 
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        
        const isSelf = memberId === adminId;
        const isAdmin = group.admin.toString() === adminId;
        
        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Không có quyền xóa thành viên' });
        }

        if (group.admin.toString() === memberId && !isSelf) {
            return res.status(400).json({ message: 'Không thể xóa admin khỏi nhóm' });
        }

        group.members = group.members.filter(
            m => m.toString() !== memberId
        );
        await group.save();

        const conv = await Conversation.findOne({ 
            isGroup: true, 
            'meta.groupId': groupId 
        });
        
        if (conv) {
            conv.members = conv.members.filter(
                m => m.toString() !== memberId
            );
            await conv.save();
        }

        try {
            const io = require('../socket').getIO();
            io.to(groupId).emit('member_removed', { 
                groupId,
                memberId,
                conversationId: conv?._id
            });
        } catch (e) { /* ignore */ }

        res.json({ message: 'Đã xóa thành viên khỏi nhóm', group });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, avatar, settings } = req.body;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ message: 'Chỉ admin mới được cập nhật nhóm' });
        }

        if (name) group.name = name.trim();
        if (description !== undefined) group.description = description.trim();
        if (avatar !== undefined) group.avatar = avatar;
        if (settings) group.settings = { ...group.settings, ...settings };

        await group.save();
        await group.populate('members', 'username avatar');
        await group.populate('admin', 'username avatar');

        if (name || avatar) {
            await Conversation.findOneAndUpdate(
                { isGroup: true, 'meta.groupId': groupId },
                { 
                    name: name || group.name, 
                    avatar: avatar !== undefined ? avatar : group.avatar 
                }
            );
        }

        res.json({ message: 'Cập nhật thành công', group });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ message: 'Chỉ admin mới được xóa nhóm' });
        }

        const conv = await Conversation.findOne({ 
            isGroup: true, 
            'meta.groupId': groupId 
        });
        
        if (conv) {
            await require('../models/message.model').Message
                .deleteMany({ conversationId: conv._id });
            await Conversation.findByIdAndDelete(conv._id);
        }

        await Group.findByIdAndDelete(groupId);

        try {
            const io = require('../socket').getIO();
            io.to(groupId).emit('group_deleted', { groupId });
        } catch (e) { /* ignore */ }

        res.json({ message: 'Đã xóa nhóm thành công' });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ error: error.message });
    }
};

const inviteToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { inviteeId } = req.body;
        const inviterId = req.userId;

        if (!inviteeId) {
            return res.status(400).json({ message: 'Thiếu thông tin người được mời' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        if (!group.members.some(m => m.toString() === inviterId)) {
            return res.status(403).json({ message: 'Bạn không ở trong nhóm này' });
        }

        if (group.members.some(m => m.toString() === inviteeId)) {
            return res.status(400).json({ message: 'Người này đã ở trong nhóm' });
        }

        const Account = require('../models/account.model');
        const inviter = await Account.findById(inviterId);
        
        const { createNotification } = require('./notification.controller');
        await createNotification({
            recipient: inviteeId,
            sender: inviterId,
            type: 'group_invite',
            title: 'Lời mời vào nhóm',
            body: `${inviter.username} đã mời bạn tham gia nhóm ${group.name}.`,
            relatedId: group._id
        });

        res.status(200).json({ success: true, message: 'Đã gửi lời mời tham gia nhóm!' });
    } catch (error) {
        console.error('Invite to group error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    createGroup, 
    getGroups, 
    getGroupById,
    joinByQR, 
    addMember, 
    removeMember,
    updateGroup,
    deleteGroup,
    inviteToGroup
};