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
            return res.status(400).json({ success: false, code: 'NAME_REQUIRED' });
        }
        if (!members || !Array.isArray(members) || members.length < 2) {
            return res.status(400).json({ 
                success: false, 
                code: 'MIN_MEMBERS_REQUIRED'
            });
        }

        for (const memberId of members) {
            if (memberId === adminId) continue;
            const isFriend = await checkFriendship(adminId, memberId);
            if (!isFriend) {
                return res.status(403).json({ 
                    success: false, 
                    code: 'NOT_FRIENDS_WITH_ALL'
                });
            }
        }

        let inviteCode;
        let exists = true;
        while (exists) {
            inviteCode = crypto.randomBytes(4).toString('hex');
            exists = await Group.findOne({ inviteCode });
        }

        const baseUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
        const inviteLink = `${baseUrl}/join-group/${inviteCode}`;

        const newGroup = new Group({
            name: name.trim(),
            description: description?.trim() || '',
            avatar: avatar || '',
            admin: adminId,
            members: [adminId, ...members],
            inviteCode,
            inviteLink,
            isGroup: true
        });

        const savedGroup = await newGroup.save();

        const qrDataUrl = await QRCode.toDataURL(inviteLink);

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
            success: true, 
            code: 'CREATE_GROUP_SUCCESS',
            group: savedGroup,
            conversationId: newConv._id
        });

    } catch (error) {
        console.error('Lỗi createGroup:', error);
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
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
            code: 'GET_GROUPS_SUCCESS',
            data: enriched,
            total: await Group.countDocuments({ members: userId })
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
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
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        const validMembers = (group.members || []).filter(member => member != null);
        const isGroupAdmin = group.admin?._id?.toString() === userId || group.admin?.toString() === userId;
        const isMember = validMembers.some(m => m._id?.toString() === userId) || isGroupAdmin;
        
        const groupType = group.settings?.groupType || 'public';
        const isPendingJoin = group.joinRequests?.some(id => id.toString() === userId) || false;

        if (!isMember && groupType !== 'public') {
            // For private/internal groups, non-members only get basic metadata for the join request view
            return res.status(403).json({
                success: false,
                code: 'NOT_GROUP_MEMBER',
                groupType,
                isPendingJoin,
                data: {
                    _id: group._id,
                    name: group.name,
                    avatar: group.avatar,
                    description: group.description,
                    admin: group.admin,
                    membersCount: validMembers.length,
                    settings: {
                        groupType: group.settings?.groupType,
                        joinPolicy: group.settings?.joinPolicy
                    }
                }
            });
        }
        
        const onlineUsers = require('../socket').getOnlineUsers();
        group.members = validMembers.map(member => ({
            ...member,
            isOnline: onlineUsers.has(member._id?.toString())
        }));
        group.isAdmin = isGroupAdmin;
        group.isMember = isMember;
        group.isPendingJoin = isPendingJoin;

        const { Post } = require('../models/content.model');
        const postCount = await Post.countDocuments({ group: groupId, postType: 'group', status: 'approved' });
        group.postCount = postCount;
        
        res.json({ success: true, code: 'GET_GROUP_BY_ID_SUCCESS', data: group });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const joinByQR = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.userId;

        if (!inviteCode) {
            return res.status(400).json({ success: false, code: 'INVITE_CODE_REQUIRED' });
        }

        const group = await Group.findOne({ inviteCode });
        if (!group) {
            return res.status(404).json({ success: false, code: 'INVALID_QR_CODE' });
        }

        // Check if already a member
        if (group.members.some(m => m.toString() === userId) || group.admin.toString() === userId) {
            return res.status(400).json({ success: false, code: 'ALREADY_IN_GROUP' });
        }

        // Check memberLimit
        const memberLimit = group.settings?.memberLimit || 0;
        if (memberLimit > 0 && group.members.length >= memberLimit) {
            return res.status(400).json({ success: false, code: 'GROUP_FULL', message: 'Nhóm đã đạt giới hạn thành viên.' });
        }

        const groupType = group.settings?.groupType || 'public';
        const joinPolicy = group.settings?.joinPolicy || 'open';

        // Private groups ALWAYS require request approval.
        // If public/internal group and joinPolicy is approval, it also requires approval.
        const requiresApproval = (groupType === 'private') || (joinPolicy === 'approval');

        if (requiresApproval) {
            if (!group.joinRequests) {
                group.joinRequests = [];
            }
            if (group.joinRequests.some(m => m.toString() === userId)) {
                return res.status(400).json({ success: false, code: 'REQUEST_ALREADY_PENDING' });
            }
            group.joinRequests.push(userId);
            await group.save();

            // Create notification for admin
            try {
                const Account = require('../models/account.model');
                const requester = await Account.findById(userId);
                const { createNotification } = require('./notification.controller');
                await createNotification({
                    recipient: group.admin,
                    sender: userId,
                    type: 'group_join_request',
                    title: 'Yêu cầu tham gia nhóm',
                    body: `${requester.username} muốn tham gia nhóm ${group.name}.`,
                    relatedId: group._id
                });
            } catch (notifErr) { /* ignore */ }

            return res.json({ success: true, code: 'JOIN_REQUEST_SUBMITTED', status: 'pending' });
        } else {
            group.members.push(userId);
            await group.save();

            // Handle Conversation
            let conv = await Conversation.findOne({
                isGroup: true,
                'meta.groupId': group._id
            });
            
            if (!conv) {
                conv = new Conversation({
                    isGroup: true,
                    name: group.name,
                    avatar: group.avatar,
                    members: [group.admin, userId],
                    admin: group.admin,
                    meta: { groupId: group._id }
                });
                await conv.save();
            } else if (!conv.members.some(m => m.toString() === userId)) {
                conv.members.push(userId);
                await conv.save();
            }

            const Account = require('../models/account.model');
            const joiningUser = await Account.findById(userId).select('username avatar email');
            const joiningUsername = joiningUser ? joiningUser.username : 'Ai đó';

            const { Message } = require('../models/message.model');
            const systemMessage = new Message({
                conversationId: conv._id,
                sender: userId,
                content: `${joiningUsername} đã tham gia nhóm`,
                type: 'system'
            });
            await systemMessage.save();

            const sysMsgData = systemMessage.toObject();

            conv.lastMessage = systemMessage._id;
            await conv.save();

            try {
                const io = require('../socket').getIO();
                io.to(group._id.toString()).emit('member_joined', { 
                    groupId: group._id,
                    user: joiningUser,
                    conversationId: conv._id
                });
                io.to(conv._id.toString()).emit('receive_message', sysMsgData);
            } catch (e) { /* ignore socket errors */ }

            return res.json({ 
                success: true, 
                code: 'JOIN_GROUP_SUCCESS', 
                status: 'approved',
                group,
                conversationId: conv._id
            });
        }
    } catch (error) {
        console.error('Join by QR error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { members } = req.body;
        const adminId = req.userId;

        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ success: false, code: 'MEMBERS_REQUIRED' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        const existingIds = group.members.map(m => m.toString());
        const toAdd = members
            .filter(id => !existingIds.includes(id.toString()))
            .map(id => new mongoose.Types.ObjectId(id));

        if (toAdd.length === 0) {
            return res.status(400).json({ success: false, code: 'ALL_ALREADY_IN_GROUP' });
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
            success: true,
            code: 'ADD_MEMBERS_SUCCESS',
            group 
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        const isSelf = memberId === adminId;
        const isAdmin = group.admin.toString() === adminId;
        
        if (!isAdmin && !isSelf) {
            return res.status(403).json({ success: false, code: 'FORBIDDEN' });
        }

        if (group.admin.toString() === memberId && !isSelf) {
            return res.status(400).json({ success: false, code: 'CANNOT_REMOVE_ADMIN' });
        }

        group.members = group.members.filter(
            m => m.toString() !== memberId
        );
        await group.save();

        const conv = await Conversation.findOne({ 
            isGroup: true, 
            'meta.groupId': groupId 
        });

        const Account = require('../models/account.model');
        const leavingUser = await Account.findById(memberId);
        const leavingUsername = leavingUser ? leavingUser.username : 'Ai đó';

        const { Message } = require('../models/message.model');
        
        let systemContent = '';
        if (memberId === adminId) {
            systemContent = `${leavingUsername} đã rời khỏi nhóm`;
        } else {
            systemContent = `${leavingUsername} đã bị xóa khỏi nhóm`;
        }

        const systemMessage = new Message({
            conversationId: conv?._id,
            sender: memberId,
            content: systemContent,
            type: 'system'
        });
        await systemMessage.save();

        const populatedSysMsg = await systemMessage.populate('sender', 'username avatar email');
        const sysMsgData = populatedSysMsg.toObject();
        
        if (conv) {
            conv.members = conv.members.filter(
                m => m.toString() !== memberId
            );
            conv.lastMessage = systemMessage._id;
            await conv.save();
        }

        try {
            const io = require('../socket').getIO();
            io.to(groupId).emit('member_removed', { 
                groupId,
                memberId,
                conversationId: conv?._id
            });
            if (conv) {
                io.to(conv._id.toString()).emit('receive_message', sysMsgData);
            }
        } catch (e) { /* ignore */ }

        res.json({ success: true, code: 'REMOVE_MEMBER_SUCCESS', group });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, avatar, settings } = req.body;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
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

        res.json({ success: true, code: 'UPDATE_GROUP_SUCCESS', group });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
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

        res.json({ success: true, code: 'DELETE_GROUP_SUCCESS' });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const inviteToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { inviteeId } = req.body;
        const inviterId = req.userId;

        if (!inviteeId) {
            return res.status(400).json({ success: false, code: 'INVITEE_REQUIRED' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        if (!group.members.some(m => m.toString() === inviterId)) {
            return res.status(403).json({ success: false, code: 'NOT_GROUP_MEMBER' });
        }

        if (group.members.some(m => m.toString() === inviteeId)) {
            return res.status(400).json({ success: false, code: 'ALREADY_IN_GROUP' });
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

        res.status(200).json({ success: true, code: 'INVITE_SENT_SUCCESS' });
    } catch (error) {
        console.error('Invite to group error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getGroupByInviteCode = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.userId;
        
        const group = await Group.findOne({ inviteCode })
            .populate('members', 'username avatar email')
            .populate('admin', 'username avatar')
            .lean();
            
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }
        
        const isMember = group.members.some(m => m._id?.toString() === userId);
        
        res.json({ 
            success: true, 
            code: 'GET_GROUP_BY_INVITE_CODE_SUCCESS', 
            data: {
                ...group,
                isMember
            }
        });
    } catch (error) {
        console.error('Get group by invite code error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const searchGroups = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, code: 'QUERY_REQUIRED' });
        }
        
        // Find public and private groups matching the query, internal groups are excluded.
        const groups = await Group.find({
            name: { $regex: q, $options: 'i' },
            'settings.groupType': { $in: ['public', 'private'] }
        })
        .populate('admin', 'username avatar')
        .select('name avatar description admin members settings joinRequests')
        .lean();
        
        const data = groups.map(g => {
            const isMember = g.members?.some(m => m.toString() === req.userId) || false;
            const isAdmin = g.admin?._id?.toString() === req.userId || g.admin?.toString() === req.userId;
            const isPendingJoin = g.joinRequests?.some(m => m.toString() === req.userId) || false;
            
            return {
                ...g,
                isMember,
                isAdmin,
                isPendingJoin,
                membersCount: g.members?.length || 0,
                members: undefined,
                joinRequests: undefined
            };
        });

        res.status(200).json({ success: true, code: 'SEARCH_GROUPS_SUCCESS', data });
    } catch (error) {
        console.error('Search groups error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        // Check if already a member
        if (group.members.some(m => m.toString() === userId) || group.admin.toString() === userId) {
            return res.status(400).json({ success: false, code: 'ALREADY_IN_GROUP' });
        }

        // Check memberLimit
        const memberLimit = group.settings?.memberLimit || 0;
        if (memberLimit > 0 && group.members.length >= memberLimit) {
            return res.status(400).json({ success: false, code: 'GROUP_FULL', message: 'Nhóm đã đạt giới hạn thành viên.' });
        }

        const groupType = group.settings?.groupType || 'public';
        const joinPolicy = group.settings?.joinPolicy || 'open';

        // Private groups ALWAYS require request approval.
        // If public/internal group and joinPolicy is approval, it also requires approval.
        const requiresApproval = (groupType === 'private') || (joinPolicy === 'approval');

        if (requiresApproval) {
            if (!group.joinRequests) {
                group.joinRequests = [];
            }
            if (group.joinRequests.some(m => m.toString() === userId)) {
                return res.status(400).json({ success: false, code: 'REQUEST_ALREADY_PENDING' });
            }
            group.joinRequests.push(userId);
            await group.save();

            // Create notification for admin
            try {
                const Account = require('../models/account.model');
                const requester = await Account.findById(userId);
                const { createNotification } = require('./notification.controller');
                await createNotification({
                    recipient: group.admin,
                    sender: userId,
                    type: 'group_join_request',
                    title: 'Yêu cầu tham gia nhóm',
                    body: `${requester.username} muốn tham gia nhóm ${group.name}.`,
                    relatedId: group._id
                });
            } catch (notifErr) { /* ignore */ }

            return res.json({ success: true, code: 'JOIN_REQUEST_SUBMITTED', status: 'pending' });
        } else {
            group.members.push(userId);
            await group.save();

            // Handle Conversation
            let conv = await Conversation.findOne({
                isGroup: true,
                'meta.groupId': group._id
            });
            
            if (!conv) {
                conv = new Conversation({
                    isGroup: true,
                    name: group.name,
                    avatar: group.avatar,
                    members: [group.admin, userId],
                    admin: group.admin,
                    meta: { groupId: group._id }
                });
                await conv.save();
            } else if (!conv.members.some(m => m.toString() === userId)) {
                conv.members.push(userId);
                await conv.save();
            }

            const Account = require('../models/account.model');
            const joiningUser = await Account.findById(userId).select('username avatar email');
            const joiningUsername = joiningUser ? joiningUser.username : 'Ai đó';

            const { Message } = require('../models/message.model');
            const systemMessage = new Message({
                conversationId: conv._id,
                sender: userId,
                content: `${joiningUsername} đã tham gia nhóm`,
                type: 'system'
            });
            await systemMessage.save();

            conv.lastMessage = systemMessage._id;
            await conv.save();

            try {
                const io = require('../socket').getIO();
                io.to(group._id.toString()).emit('member_joined', { 
                    groupId: group._id,
                    user: joiningUser,
                    conversationId: conv._id
                });
                io.to(conv._id.toString()).emit('receive_message', systemMessage.toObject());
            } catch (e) { /* ignore */ }

            return res.json({ 
                success: true, 
                code: 'JOIN_GROUP_SUCCESS', 
                status: 'approved',
                group,
                conversationId: conv._id
            });
        }
    } catch (error) {
        console.error('joinGroup error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getJoinRequests = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId).populate('joinRequests', 'username avatar email');
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        res.json({ success: true, code: 'GET_JOIN_REQUESTS_SUCCESS', data: group.joinRequests || [] });
    } catch (error) {
        console.error('getJoinRequests error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const handleJoinRequest = async (req, res) => {
    try {
        const { groupId, requestUserId } = req.params;
        const { action } = req.body; // 'approve' | 'reject'
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        // Verify if user is in joinRequests
        if (!group.joinRequests || !group.joinRequests.some(id => id.toString() === requestUserId)) {
            return res.status(400).json({ success: false, code: 'REQUEST_NOT_FOUND' });
        }

        // Remove from joinRequests
        group.joinRequests = group.joinRequests.filter(id => id.toString() !== requestUserId);

        if (action === 'approve') {
            // Check memberLimit
            const memberLimit = group.settings?.memberLimit || 0;
            if (memberLimit > 0 && group.members.length >= memberLimit) {
                return res.status(400).json({ success: false, code: 'GROUP_FULL', message: 'Nhóm đã đạt giới hạn thành viên.' });
            }

            // Add to members
            group.members.push(requestUserId);
            await group.save();

            // Handle Conversation
            let conv = await Conversation.findOne({
                isGroup: true,
                'meta.groupId': group._id
            });
            
            if (!conv) {
                conv = new Conversation({
                    isGroup: true,
                    name: group.name,
                    avatar: group.avatar,
                    members: [group.admin, requestUserId],
                    admin: group.admin,
                    meta: { groupId: group._id }
                });
                await conv.save();
            } else if (!conv.members.some(m => m.toString() === requestUserId)) {
                conv.members.push(requestUserId);
                await conv.save();
            }

            const Account = require('../models/account.model');
            const joiningUser = await Account.findById(requestUserId).select('username avatar email');
            const joiningUsername = joiningUser ? joiningUser.username : 'Ai đó';

            const { Message } = require('../models/message.model');
            const systemMessage = new Message({
                conversationId: conv._id,
                sender: requestUserId,
                content: `${joiningUsername} đã tham gia nhóm`,
                type: 'system'
            });
            await systemMessage.save();

            conv.lastMessage = systemMessage._id;
            await conv.save();

            try {
                const io = require('../socket').getIO();
                io.to(group._id.toString()).emit('member_joined', { 
                    groupId: group._id,
                    user: joiningUser,
                    conversationId: conv._id
                });
                io.to(conv._id.toString()).emit('receive_message', systemMessage.toObject());
            } catch (e) { /* ignore */ }

            // Notify user that their request has been approved
            try {
                const { createNotification } = require('./notification.controller');
                await createNotification({
                    recipient: requestUserId,
                    sender: adminId,
                    type: 'group_join_approved',
                    title: 'Yêu cầu tham gia nhóm được duyệt',
                    body: `Yêu cầu tham gia nhóm ${group.name} của bạn đã được duyệt.`,
                    relatedId: group._id
                });
            } catch (notifErr) { /* ignore */ }

        } else {
            // Reject request
            await group.save();

            // Notify user that their request has been rejected
            try {
                const { createNotification } = require('./notification.controller');
                await createNotification({
                    recipient: requestUserId,
                    sender: adminId,
                    type: 'group_join_rejected',
                    title: 'Yêu cầu tham gia nhóm bị từ chối',
                    body: `Yêu cầu tham gia nhóm ${group.name} của bạn đã bị từ chối.`,
                    relatedId: group._id
                });
            } catch (notifErr) { /* ignore */ }
        }

        res.json({ success: true, code: `JOIN_REQUEST_${action.toUpperCase()}D` });
    } catch (error) {
        console.error('handleJoinRequest error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getPendingPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        const { Post } = require('../models/content.model');
        const pendingPosts = await Post.find({
            group: groupId,
            postType: 'group',
            status: 'pending'
        })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .lean();

        res.json({ success: true, code: 'GET_PENDING_POSTS_SUCCESS', data: pendingPosts });
    } catch (error) {
        console.error('getPendingPosts error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const handlePendingPost = async (req, res) => {
    try {
        const { groupId, postId } = req.params;
        const { action } = req.body; // 'approve' | 'reject'
        const adminId = req.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
        }

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        const { Post } = require('../models/content.model');
        const post = await Post.findOne({ _id: postId, group: groupId });
        if (!post) {
            return res.status(404).json({ success: false, code: 'POST_NOT_FOUND' });
        }

        if (action === 'approve') {
            post.status = 'approved';
            await post.save();

            // Trigger notification to group members or friends of author
            try {
                const Account = require('../models/account.model');
                const authorUser = await Account.findById(post.author);
                const friends = authorUser.friends || [];
                const uniqueFriendIds = [...new Set(friends.map(id => id.toString()))];
                const { createNotification } = require('./notification.controller');

                for (const friendId of uniqueFriendIds) {
                    await createNotification({
                        recipient: friendId,
                        sender: post.author,
                        type: 'new_post',
                        title: 'Bài viết mới từ bạn bè',
                        body: `${authorUser.username} vừa đăng một bài viết mới trong nhóm ${group.name}.`,
                        relatedId: post._id
                    });
                }

                // Notify post author that their post was approved
                if (post.author.toString() !== adminId) {
                    await createNotification({
                        recipient: post.author,
                        sender: adminId,
                        type: 'group_post_approved',
                        title: 'Bài viết được phê duyệt',
                        body: `Bài viết của bạn trong nhóm ${group.name} đã được phê duyệt.`,
                        relatedId: post._id
                    });
                }
            } catch (notifErr) { /* ignore */ }

        } else {
            post.status = 'rejected';
            await post.save();

            // Notify post author that their post was rejected
            try {
                const { createNotification } = require('./notification.controller');
                if (post.author.toString() !== adminId) {
                    await createNotification({
                        recipient: post.author,
                        sender: adminId,
                        type: 'group_post_rejected',
                        title: 'Bài viết bị từ chối',
                        body: `Bài viết của bạn trong nhóm ${group.name} đã bị từ chối phê duyệt.`,
                        relatedId: post._id
                    });
                }
            } catch (notifErr) { /* ignore */ }
        }

        res.json({ success: true, code: `POST_${action.toUpperCase()}D` });
    } catch (error) {
        console.error('handlePendingPost error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
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
    inviteToGroup,
    getGroupByInviteCode,
    searchGroups,
    joinGroup,
    getJoinRequests,
    handleJoinRequest,
    getPendingPosts,
    handlePendingPost
};