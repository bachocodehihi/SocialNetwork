const jwt = require('jsonwebtoken');
const Account = require('../models/account.model');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, code: 'TOKEN_NOT_FOUND' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        
        const user = await Account.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        if (user.isBanned) {
            const allowedUrls = ['/profile', '/appeal'];
            const isAllowed = allowedUrls.some(url => req.originalUrl.endsWith(url));
            if (!isAllowed) {
                return res.status(403).json({ 
                    success: false, 
                    code: 'ACCOUNT_BANNED', 
                    message: user.banReason,
                    banAppealed: user.banAppealed
                });
            }
        }

        next();
    } catch (err) {
        return res.status(403).json({ success: false, code: 'INVALID_TOKEN' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await Account.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, code: 'NOT_ADMIN' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

module.exports = { verifyToken, isAdmin };
