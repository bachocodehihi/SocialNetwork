const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String },
    birthday: { type: Date, required: true },
    gender: { type: String, required: true },
    avatar: { type: String, default: process.env.DEFAULT_AVATAR_URL },
    googleId: { type: String, default: null },
    code: { type: String },
    isVerified: { type: Boolean, default: false },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    job: { type: String, default: '' },
    nationality: { type: String, default: '' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    lastSeen: { type: Date, default: Date.now },
    fcmToken: { type: String, default: null },
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
