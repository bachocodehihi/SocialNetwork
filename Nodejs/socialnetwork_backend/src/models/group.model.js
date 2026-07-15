const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    description: { type: String, default: '' },
    admin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account', 
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account' 
    }],
    inviteCode: { type: String, unique: true, sparse: true, index: true },
    qrCode: { type: String },
    inviteLink: { type: String },
    isGroup: { type: Boolean, default: true },
    settings: {
        onlyAdminCanPost: { type: Boolean, default: false },
        onlyAdminCanAddMember: { type: Boolean, default: false },
        allowMemberInvite: { type: Boolean, default: true },
        groupType: { type: String, enum: ['public', 'private', 'internal'], default: 'public' },
        joinPolicy: { type: String, enum: ['open', 'approval'], default: 'open' },
        postPolicy: { type: String, enum: ['open', 'approval'], default: 'open' },
        memberLimit: { type: Number, default: 0 }
    },
    joinRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: []
    }]
}, { timestamps: true });

groupSchema.index({ members: 1 });
groupSchema.index({ admin: 1 });

module.exports = mongoose.model('Group', groupSchema);