const Call = require('../models/call.model');
const Account = require('../models/account.model');

exports.getMissedCallCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const since = req.query.since ? new Date(Number(req.query.since)) : req.user.lastMissedCallCheck;
        
        const count = await Call.countDocuments({
            receiver: userId,
            status: 'missed',
            createdAt: since ? { $gt: since } : undefined
        });
        
        res.json({ 
            success: true, 
            code: 'GET_MISSED_CALL_COUNT_SUCCESS',
            data: { missedCallCount: count } 
        });
    } catch (err) { 
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        }); 
    }
};

exports.markMissedCallsRead = async (req, res) => {
    try {
        await Account.findByIdAndUpdate(req.user.id, { lastMissedCallCheck: new Date() });
        res.json({ 
            success: true, 
            code: 'MARK_MISSED_CALLS_READ_SUCCESS'
        });
    } catch (err) { 
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        }); 
    }
};

exports.getCallHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, onlyMissed } = req.query;
        const userId = req.user.id;
        
        const query = { $or: [{ caller: userId }, { receiver: userId }] };
        if (onlyMissed === 'true') { query.receiver = userId; query.status = 'missed'; }
        else {
            if (type) query.callType = type;
            if (status) query.status = status;
        }
        
        const calls = await Call.find(query)
            .populate('caller', 'username avatar')
            .populate('receiver', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
            
        res.json({ 
            success: true, 
            code: 'GET_CALL_HISTORY_SUCCESS',
            data: calls, 
            pagination: { page: Number(page), limit: Number(limit), total: await Call.countDocuments(query) } 
        });
    } catch (err) { 
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        }); 
    }
};