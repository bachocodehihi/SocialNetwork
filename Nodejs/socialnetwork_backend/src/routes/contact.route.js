const express = require('express');
const router = express.Router();
const { sendRequest, getRelationship, cancelRequest, acceptRequest, removeFriend, followUser, unfollowUser, getRequests, rejectRequest, getFriends } = require('../controllers/contact.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/requests', verifyToken, getRequests);
router.get('/friends', verifyToken, getFriends);
router.post('/request', verifyToken, sendRequest);
router.get('/relationship/:userId', verifyToken, getRelationship);
router.post('/reject', verifyToken, rejectRequest);
router.post('/cancel', verifyToken, cancelRequest);
router.post('/accept', verifyToken, acceptRequest);
router.post('/remove', verifyToken, removeFriend);

router.post('/follow', verifyToken, followUser);
router.post('/unfollow', verifyToken, unfollowUser);

module.exports = router;

