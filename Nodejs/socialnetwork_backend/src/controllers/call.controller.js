const Call = require('../models/call.model');
const Account = require('../models/account.model');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

exports.getAgoraToken = async (req, res) => {
    try {
        const { channelName } = req.query;
        if (!channelName) {
            return res.status(400).json({
                success: false,
                code: 'CHANNEL_NAME_REQUIRED',
                message: 'channelName query parameter is required'
            });
        }

        const appId = process.env.AGORA_APP_ID || '63c3b289a0ad46fb90f74f68554f4a9f';
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (!appCertificate) {
            return res.status(500).json({
                success: false,
                code: 'AGORA_CONFIG_ERROR',
                message: 'Agora APP_CERTIFICATE is not configured on the server.'
            });
        }

        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Build RTC Token using wildcard UID 0 so any user can join with this token
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            0,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );

        res.json({
            success: true,
            code: 'GENERATE_AGORA_TOKEN_SUCCESS',
            data: {
                token,
                appId,
                channelName
            }
        });
    } catch (err) {
        console.error('Error generating Agora token:', err);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR'
        });
    }
};

exports.getMissedCallCount = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await Account.findById(userId).select('lastMissedCallCheck').lean();
        const since = req.query.since ? new Date(Number(req.query.since)) : user?.lastMissedCallCheck;
        
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
        await Account.findByIdAndUpdate(req.userId, { lastMissedCallCheck: new Date() });
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
        const userId = req.userId;
        
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