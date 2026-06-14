const Notification = require('../models/notification.model');
const Account = require('../models/account.model');

const createNotification = async ({ recipient, sender, type, title, body, relatedId }) => {
    try {
        if (recipient.toString() === sender.toString()) return null;

        const newNotif = new Notification({
            recipient,
            sender,
            type,
            title,
            body,
            relatedId
        });
        await newNotif.save();

        try {
            const recipientUser = await Account.findById(recipient).lean();
            if (recipientUser && recipientUser.fcmToken) {
                const senderUser = await Account.findById(sender).lean();
                const { sendPushNotification } = require('../services/fcm.service');
                await sendPushNotification({
                    fcmToken: recipientUser.fcmToken,
                    title: title,
                    body: body,
                    type: type,
                    relatedId: relatedId,
                    senderName: senderUser ? senderUser.username : '',
                    senderAvatar: senderUser ? senderUser.avatar : ''
                });
            }
        } catch (fcmErr) {
            console.error('Error triggering FCM Push Notification:', fcmErr);
        }

        return newNotif;
    } catch (err) {
        console.error('Error creating notification:', err);
        return null;
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();

        const FriendRequest = require('../models/contact.model');
        const updatedNotifications = await Promise.all(notifications.map(async (notif) => {
            if (notif.type === 'friend_request' && notif.relatedId) {
                if (notif.status && notif.status !== 'pending') {
                    return {
                        ...notif,
                        requestStatus: notif.status
                    };
                }
                const request = await FriendRequest.findById(notif.relatedId).lean();
                return {
                    ...notif,
                    requestStatus: request ? request.status : 'deleted'
                };
            }
            return notif;
        }));

        res.status(200).json(updatedNotifications);
    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, code: 'MARK_ALL_READ_SUCCESS' });
    } catch (err) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAllRead
};
