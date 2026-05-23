const jwt = require('jsonwebtoken');
const Account = require('../models/account.model');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token not found!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        
        const user = await Account.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found!" });

        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token!" });
    }
};

module.exports = { verifyToken };
