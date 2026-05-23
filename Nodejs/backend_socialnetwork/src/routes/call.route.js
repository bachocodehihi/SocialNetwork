const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');

router.get('/calls/missed/count', callController.getMissedCallCount);
router.post('/calls/missed/read', callController.markMissedCallsRead);
router.get('/calls', callController.getCallHistory);

module.exports = router;