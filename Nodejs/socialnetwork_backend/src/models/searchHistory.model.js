const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    searchedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
}, { timestamps: true });

searchHistorySchema.index({ user: 1, searchedUser: 1 }, { unique: true });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
module.exports = SearchHistory;
