const FriendRequest = require('../models/contact.model');
const Account = require('../models/account.model');
const { createNotification } = require('./notification.controller');

const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.userId;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, code: 'CANNOT_ADD_YOURSELF' });
        }

        const currentUser = await Account.findById(senderId);
        if (currentUser.friends.includes(receiverId)) {
            return res.status(400).json({ success: false, code: 'ALREADY_FRIENDS' });
        }

        let request = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (request) {
            if (
                request.sender.toString() === receiverId &&
                request.status === 'pending'
            ) {
                request.status = 'accepted';
                await request.save();

                await Account.findByIdAndUpdate(senderId, {
                    $addToSet: { friends: receiverId }
                });
                await Account.findByIdAndUpdate(receiverId, {
                    $addToSet: { friends: senderId }
                });

                await createNotification({
                    recipient: receiverId,
                    sender: senderId,
                    type: 'friend_accept',
                    title: 'Đã trở thành bạn bè',
                    body: `${currentUser.username} đã chấp nhận lời mời kết bạn của bạn.`,
                    relatedId: request._id
                });

                return res.json({ success: true, code: 'AUTO_ACCEPTED', type: 'auto_accepted' });
            }

            if (request.status === 'rejected') {
                await request.deleteOne();
            } else {
                return res.status(400).json({ success: false, code: 'REQUEST_ALREADY_EXISTS' });
            }
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId
        });

        await newRequest.save();

        await createNotification({
            recipient: receiverId,
            sender: senderId,
            type: 'friend_request',
            title: 'Lời mời kết bạn mới',
            body: `${currentUser.username} đã gửi cho bạn một lời mời kết bạn.`,
            relatedId: newRequest._id
        });

        res.json({
            success: true,
            code: 'FRIEND_REQUEST_SENT',
            type: 'sent',
            requestId: newRequest._id
        });

    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getRelationship = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await Account.findById(req.userId);

        if (currentUser.friends.includes(userId)) {
            return res.json({ success: true, code: 'GET_RELATIONSHIP_SUCCESS', status: 'friend' });
        }

        const request = await FriendRequest.findOne({
            $or: [
                { sender: req.userId, receiver: userId },
                { sender: userId, receiver: req.userId }
            ]
        });

        if (!request || request.status === 'rejected') {
            return res.json({ success: true, code: 'GET_RELATIONSHIP_SUCCESS', status: 'none' });
        }

        if (request.status === 'pending') {
            if (request.sender.toString() === req.userId) {
                return res.json({ success: true, code: 'GET_RELATIONSHIP_SUCCESS', status: 'requested', requestId: request._id });
            } else {
                return res.json({ success: true, code: 'GET_RELATIONSHIP_SUCCESS', status: 'received', requestId: request._id });
            }
        }

        return res.json({ success: true, code: 'GET_RELATIONSHIP_SUCCESS', status: 'none' });

    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        await FriendRequest.findOneAndDelete({
            _id: requestId,
            status: 'pending',
            $or: [
                { sender: req.userId },
                { receiver: req.userId }
            ]
        });

        const Notification = require('../models/notification.model');
        await Notification.updateMany(
            { type: 'friend_request', relatedId: requestId },
            { $set: { status: 'cancelled' } }
        );

        res.json({ success: true, code: 'CANCEL_REQUEST_SUCCESS' });
    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        const request = await FriendRequest.findById(requestId);

        if (!request || request.receiver.toString() !== req.userId) {
            return res.status(404).json({ success: false, code: 'NOT_FOUND' });
        }

        request.status = 'accepted';
        await request.save();

        await Account.findByIdAndUpdate(req.userId, {
            $addToSet: { friends: request.sender }
        });

        await Account.findByIdAndUpdate(request.sender, {
            $addToSet: { friends: req.userId }
        });

        const receiverUser = await Account.findById(req.userId);
        await createNotification({
            recipient: request.sender,
            sender: req.userId,
            type: 'friend_accept',
            title: 'Chấp nhận lời mời kết bạn',
            body: `${receiverUser.username} đã chấp nhận lời mời kết bạn của bạn.`,
            relatedId: request._id
        });

        const Notification = require('../models/notification.model');
        await Notification.updateMany(
            { recipient: req.userId, type: 'friend_request', relatedId: request._id },
            { $set: { status: 'accepted' } }
        );

        res.json({ success: true, code: 'ACCEPT_REQUEST_SUCCESS' });
    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};


const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        await Account.findByIdAndUpdate(req.userId, { $pull: { friends: friendId } });
        await Account.findByIdAndUpdate(friendId, { $pull: { friends: req.userId } });
        
        await FriendRequest.findOneAndDelete({
            $or: [
                { sender: req.userId, receiver: friendId },
                { sender: friendId, receiver: req.userId }
            ]
        });

        res.status(200).json({ success: true, code: 'REMOVE_FRIEND_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const followUser = async (req, res) => {
    try {
        const { targetId } = req.body;
        if (req.userId === targetId) return res.status(400).json({ success: false, code: 'CANNOT_FOLLOW_YOURSELF' });

        const targetUser = await Account.findById(targetId);
        if (!targetUser) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        await Account.findByIdAndUpdate(targetId, { $addToSet: { followers: req.userId } });
        await Account.findByIdAndUpdate(req.userId, { $addToSet: { following: targetId } });

        res.status(200).json({ success: true, code: 'FOLLOW_USER_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { targetId } = req.body;
        
        await Account.findByIdAndUpdate(targetId, { $pull: { followers: req.userId } });
        await Account.findByIdAndUpdate(req.userId, { $pull: { following: targetId } });

        res.status(200).json({ success: true, code: 'UNFOLLOW_USER_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ receiver: req.userId, status: 'pending' })
            .populate('sender', '-password')
            .lean();

        res.status(200).json({ success: true, code: 'GET_REQUESTS_SUCCESS', data: requests });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getFriends = async (req, res) => {
    try {
        const user = await Account.findById(req.userId)
            .populate('friends', '-password');

        if (!user) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        const validFriends = (user.friends || []).filter(friend => friend != null);

        const friendsWithStatus = validFriends.map(friend => {
            const lastSeen = friend.lastSeen;
            let status = 'Offline';
            
            if (lastSeen) {
                const now = new Date();
                const diffMinutes = Math.floor((now - new Date(lastSeen)) / 60000);
                if (!isNaN(diffMinutes)) {
                    status = diffMinutes < 5 ? 'Online' : `Last active ${diffMinutes}m ago`;
                }
            }
            
            return {
                ...friend.toObject(),
                status,
                friendsCount: friend.friends?.length ?? 0,
                followersCount: friend.followers?.length ?? 0,
                followingCount: friend.following?.length ?? 0
            };
        });

        res.status(200).json({ success: true, code: 'GET_FRIENDS_SUCCESS', data: friendsWithStatus });
    } catch (error) {
        console.error('getFriends error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        const request = await FriendRequest.findById(requestId);

        if (!request || request.receiver.toString() !== req.userId) {
            return res.status(404).json({ success: false, code: 'NOT_FOUND' });
        }

        request.status = 'rejected';
        await request.save();

        const receiverUser = await Account.findById(req.userId);
        await createNotification({
            recipient: request.sender,
            sender: req.userId,
            type: 'friend_reject',
            title: 'Từ chối lời mời kết bạn',
            body: `${receiverUser.username} đã từ chối lời mời kết bạn của bạn.`,
            relatedId: request._id
        });

        const Notification = require('../models/notification.model');
        await Notification.updateMany(
            { recipient: req.userId, type: 'friend_request', relatedId: request._id },
            { $set: { status: 'rejected' } }
        );

        res.json({ success: true, code: 'REJECT_REQUEST_SUCCESS' });
    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

module.exports = { 
    sendRequest, 
    getRelationship, 
    cancelRequest, 
    acceptRequest, 
    removeFriend, 
    followUser, 
    unfollowUser, 
    getRequests, 
    rejectRequest, 
    getFriends 
};
