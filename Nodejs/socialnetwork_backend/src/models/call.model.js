const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation',
        required: true 
    },
    caller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account',
        required: true 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account',
        required: false 
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    callType: { 
        type: String, 
        enum: ['voice', 'video', 'audio'],
        required: true 
    },
    status: { 
        type: String, 
        enum: ['ringing', 'accepted', 'rejected', 'cancelled', 'missed', 'ended', 'busy'],
        default: 'ringing'
    },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    startedAt: Date,
    endedAt: Date,
    duration: { type: Number, default: 0 },
    offer: Object,
    answer: Object
}, { timestamps: true });

callSchema.index({ caller: 1, status: 1 });
callSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Call', callSchema);