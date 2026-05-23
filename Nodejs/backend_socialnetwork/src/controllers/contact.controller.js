const FriendRequest = require('../models/contact.model');
const Account = require('../models/account.model');
const { createNotification } = require('./notification.controller');

const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.userId;

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot add yourself!" });
        }

        const currentUser = await Account.findById(senderId);
        if (currentUser.friends.includes(receiverId)) {
            return res.status(400).json({ message: "Already friends!" });
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

                return res.json({ type: 'auto_accepted' });
            }

            if (request.status === 'rejected') {
                await request.deleteOne();
            } else {
                return res.status(400).json({ message: "Request already exists!" });
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
            type: 'sent',
            requestId: newRequest._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRelationship = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await Account.findById(req.userId);

        if (currentUser.friends.includes(userId)) {
            return res.json({ status: 'friend' });
        }

        const request = await FriendRequest.findOne({
            $or: [
                { sender: req.userId, receiver: userId },
                { sender: userId, receiver: req.userId }
            ]
        });

        if (!request || request.status === 'rejected') {
            return res.json({ status: 'none' });
        }

        if (request.status === 'pending') {
            if (request.sender.toString() === req.userId) {
                return res.json({ status: 'requested', requestId: request._id });
            } else {
                return res.json({ status: 'received', requestId: request._id });
            }
        }

        return res.json({ status: 'none' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const cancelRequest = async (req, res) => {
    const { requestId } = req.body;

    await FriendRequest.findOneAndDelete({
        _id: requestId,
        status: 'pending',
        $or: [
            { sender: req.userId },
            { receiver: req.userId }
        ]
    });

    res.json({ message: "Cancelled" });
};

const acceptRequest = async (req, res) => {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== req.userId) {
        return res.status(404).json({ message: "Not found" });
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

    res.json({ message: "Accepted" });
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

        res.status(200).json({ message: "Friend removed successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const followUser = async (req, res) => {
    try {
        const { targetId } = req.body;
        if (req.userId === targetId) return res.status(400).json({ message: "Cannot follow yourself!" });

        const targetUser = await Account.findById(targetId);
        if (!targetUser) return res.status(404).json({ message: "User not found!" });

        await Account.findByIdAndUpdate(targetId, { $addToSet: { followers: req.userId } });
        await Account.findByIdAndUpdate(req.userId, { $addToSet: { following: targetId } });

        res.status(200).json({ message: "Successfully followed user!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { targetId } = req.body;
        
        await Account.findByIdAndUpdate(targetId, { $pull: { followers: req.userId } });
        await Account.findByIdAndUpdate(req.userId, { $pull: { following: targetId } });

        res.status(200).json({ message: "Successfully unfollowed user!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ receiver: req.userId, status: 'pending' })
            .populate('sender', '-password')
            .lean();

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFriends = async (req, res) => {
    try {
        const user = await Account.findById(req.userId)
            .populate('friends', '-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
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

        res.status(200).json(friendsWithStatus);
    } catch (error) {
        console.error('getFriends error:', error);
        res.status(500).json({ error: error.message });
    }
};

const rejectRequest = async (req, res) => {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== req.userId) {
        return res.status(404).json({ message: "Not found" });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: "Rejected" });
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
