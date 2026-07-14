const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String },
    birthday: { type: Date, required: true },
    gender: { type: String, required: true },
    avatar: { type: String, default: process.env.DEFAULT_AVATAR_URL },
    googleId: { type: String, default: null },
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
    isDeleted: { type: Boolean, default: false },
    deleteAt: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    banAppealed: { type: Boolean, default: false },
    appealContent: { type: String, default: '' },
    reportsCount: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    qrCode: { type: String, default: '' },
    relationship: {
        status: { type: String, enum: ['none', 'single', 'dating', 'engaged', 'married', 'complicated'], default: 'none' },
        partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null }
    },
    privacy: {
        email: { type: Boolean, default: true },
        phone: { type: Boolean, default: true },
        address: { type: Boolean, default: true },
        birthday: { type: Boolean, default: true },
        gender: { type: Boolean, default: true },
        job: { type: Boolean, default: true },
        nationality: { type: Boolean, default: true },
        isPrivate: { type: Boolean, default: false },
        relationship: { type: Boolean, default: true },
    },
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
