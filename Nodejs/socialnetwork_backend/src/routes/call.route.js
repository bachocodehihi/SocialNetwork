const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/calls/missed/count', verifyToken, callController.getMissedCallCount);
router.post('/calls/missed/read', verifyToken, callController.markMissedCallsRead);
router.get('/calls', verifyToken, callController.getCallHistory);
router.get('/calls/token', verifyToken, callController.getAgoraToken);

module.exports = router;