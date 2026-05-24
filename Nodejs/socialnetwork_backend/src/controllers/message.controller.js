const { Conversation, Message } = require('../models/message.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const fcm = require('../services/fcm.service');

const createConversation = async (req, res) => {
    try {
        const { receiverId, isGroup, name, members, avatar, groupId } = req.body;
        const adminId = req.userId;

        if (isGroup) {
            if (groupId) {
                const existingConv = await Conversation.findOne({
                    isGroup: true,
                    'meta.groupId': groupId
                }).populate('members', 'username avatar email');
                
                if (existingConv) {
                    return res.status(200).json(existingConv);
                }

                const group = await Group.findById(groupId);
                if (!group) {
                    return res.status(404).json({ message: 'Group not found' });
                }

                if (!group.members.some(m => m.toString() === adminId)) {
                    return res.status(403).json({ 
                        message: 'Bạn không phải thành viên nhóm này' 
                    });
                }

                const newConv = new Conversation({
                    isGroup: true,
                    name: group.name,
                    avatar: group.avatar || avatar,
                    members: group.members,
                    admin: group.admin,
                    meta: { groupId: groupId }
                });
                
                await newConv.save();
                await newConv.populate('members', 'username avatar email');
                
                return res.status(201).json({
                    message: 'Tạo cuộc trò chuyện thành công',
                    conversation: newConv
                });
            }
            
            const groupMembers = members 
                ? [...new Set([...members.map(m => m.toString()), adminId])] 
                : [adminId];
            
            if (groupMembers.length < 2) {
                return res.status(400).json({ 
                    message: 'Cuộc trò chuyện nhóm cần ít nhất 2 thành viên' 
                });
            }

            const existingConv = await Conversation.findOne({
                isGroup: true,
                name: name,
                members: { $all: groupMembers, $size: groupMembers.length }
            }).populate('members', 'username avatar email');
            
            if (existingConv) {
                return res.status(200).json(existingConv);
            }

            const newConv = new Conversation({
                isGroup: true, 
                name, 
                avatar, 
                members: groupMembers, 
                admin: adminId
            });
            
            await newConv.save();
            await newConv.populate('members', 'username avatar email');
            
            return res.status(201).json({
                message: 'Tạo cuộc trò chuyện thành công',
                conversation: newConv
            });
            
        } else {
            if (!receiverId) {
                return res.status(400).json({ message: 'receiverId is required' });
            }

            const existingConv = await Conversation.findOne({
                isGroup: false,
                members: { $all: [adminId, receiverId], $size: 2 }
            }).populate('members', 'username avatar email');
            
            if (existingConv) {
                return res.status(200).json(existingConv);
            }

            const newConv = new Conversation({ 
                isGroup: false, 
                members: [adminId, receiverId] 
            });
            await newConv.save();
            await newConv.populate('members', 'username avatar email');
            
            return res.status(201).json({
                message: 'Tạo cuộc trò chuyện thành công',
                conversation: newConv
            });
        }
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content, type, attachments } = req.body;
        
        if (!content?.trim() && (!attachments || attachments.length === 0)) {
            return res.status(400).json({ message: 'Content or attachments required' });
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        
        if (!conv.members.some(m => m.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not authorized for this conversation' });
        }

        const newMsg = new Message({ 
            conversationId, 
            sender: req.userId, 
            content: content?.trim() || '',
            type: type || 'text',
            attachments: attachments || []
        });
        
        await newMsg.save();
        await Conversation.findByIdAndUpdate(conversationId, { 
            lastMessage: newMsg._id,
            updatedAt: new Date()
        });
        
        const populated = await newMsg.populate('sender', 'username avatar email');
        const messageData = populated.toObject();
        
        try {
            const io = require('../socket').getIO();
            io.to(conversationId).emit('receive_message', messageData);
        } catch (socketErr) {
            console.warn('Socket emit warning:', socketErr.message);
        }

        // Send FCM push notifications to offline / background users
        try {
            const onlineUsers = require('../socket').getOnlineUsers();
            const populatedConv = await Conversation.findById(conversationId)
                .populate('members', '_id fcmToken')
                .lean();

            if (populatedConv?.members) {
                for (const member of populatedConv.members) {
                    const memberId = member._id.toString();
                    if (memberId === req.userId) continue;
                    if (onlineUsers.has(memberId)) continue;
                    if (!member.fcmToken) continue;

                    await fcm.sendMessageNotification({
                        fcmToken: member.fcmToken,
                        senderName: populated.sender.username,
                        senderAvatar: populated.sender.avatar || '',
                        message: content || '',
                        conversationId: conversationId.toString(),
                        groupName: populatedConv.isGroup ? populatedConv.name : null
                    });
                }
            }
        } catch (fcmErr) {
            console.error('FCM sendMessage API error:', fcmErr.message);
        }
        
        res.status(201).json(messageData);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ members: req.userId })
            .populate('members', 'username avatar email lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username avatar' }
            })
            .sort({ updatedAt: -1 })
            .lean();
            
        const onlineUsers = require('../socket').getOnlineUsers();
        const enriched = conversations.map(conv => ({
            ...conv,
            members: conv.members?.map(member => ({
                ...member,
                isOnline: onlineUsers.has(member._id?.toString())
            }))
        }));
            
        res.status(200).json(enriched);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;
        
        const conv = await Conversation.findById(conversationId);
        if (!conv) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        
        if (!conv.members.some(m => m.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'username avatar email')
            .populate('repliedTo', 'content sender')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        await Message.updateMany(
            { 
                conversationId, 
                sender: { $ne: req.userId },
                readBy: { $ne: req.userId } 
            },
            { $addToSet: { readBy: req.userId } }
        );
        
        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { forEveryone } = req.body;
        
        const msg = await Message.findById(messageId);
        if (!msg) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const conv = await Conversation.findById(msg.conversationId);
        const isSender = msg.sender.toString() === req.userId;
        const isAdmin = conv?.admin?.toString() === req.userId;
        
        if (!isSender && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (forEveryone && isAdmin) {
            await Message.findByIdAndDelete(messageId);

            try {
                const io = require('../socket').getIO();
                io.to(msg.conversationId.toString()).emit('message_deleted', {
                    messageId,
                    conversationId: msg.conversationId,
                    deletedBy: req.userId
                });
            } catch (e) { /* ignore socket errors */ }
        } else {
            await Message.findByIdAndUpdate(messageId, {
                $pull: { readBy: req.userId }
            });
        }
        
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        const conv = await Conversation.findById(conversationId);
        if (!conv || !conv.members.some(m => m.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Message.updateMany(
            { 
                conversationId, 
                sender: { $ne: req.userId },
                readBy: { $ne: req.userId } 
            },
            { $addToSet: { readBy: req.userId } }
        );
        
        try {
            const io = require('../socket').getIO();
            io.to(conversationId).emit('messages_read', {
                conversationId,
                userId: req.userId,
                timestamp: new Date()
            });
        } catch (e) { /* ignore */ }
        
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    createConversation, 
    getConversations, 
    getMessages, 
    sendMessage,
    deleteMessage,
    markAsRead
};