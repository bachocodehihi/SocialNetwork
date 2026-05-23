const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    type: { type: String, enum: ['friend_request', 'friend_accept', 'post_like', 'post_comment', 'new_post', 'group_invite'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
