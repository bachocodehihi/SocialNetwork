const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead } = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, getNotifications);
router.post('/mark-read', verifyToken, markAllRead);

module.exports = router;
