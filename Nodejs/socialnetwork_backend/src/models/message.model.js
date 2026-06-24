const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    avatar: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    pinnedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

    meta: {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
    }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account', 
        required: true 
    },
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['text', 'image', 'file', 'audio'], 
        default: 'text' 
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    isRecalled: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },

    repliedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message',
        default: null
    },

    attachments: [{ 
        type: String 
    }]
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };