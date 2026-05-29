const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    reason: { type: String, required: true },
}, { timestamps: true });

reportSchema.index({ reporter: 1, target: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
