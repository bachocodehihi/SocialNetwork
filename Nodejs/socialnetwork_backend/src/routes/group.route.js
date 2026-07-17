const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { 
    createGroup, 
    getGroups, 
    getGroupById,
    joinByQR, 
    addMember, 
    removeMember,
    updateGroup,
    deleteGroup,
    inviteToGroup,
    getGroupByInviteCode,
    searchGroups,
    joinGroup,
    getJoinRequests,
    handleJoinRequest,
    getPendingPosts,
    handlePendingPost
} = require('../controllers/group.controller');

router.get('/', verifyToken, getGroups);
router.get('/search', verifyToken, searchGroups);
router.get('/invite/:inviteCode', verifyToken, getGroupByInviteCode);
router.get('/:groupId', verifyToken, getGroupById);
router.post('/', verifyToken, createGroup);
router.put('/:groupId', verifyToken, updateGroup);
router.delete('/:groupId', verifyToken, deleteGroup);
router.post('/join-qr', verifyToken, joinByQR);
router.post('/:groupId/join', verifyToken, joinGroup);
router.post('/:groupId/members', verifyToken, addMember);      
router.delete('/:groupId/members/:memberId', verifyToken, removeMember);
router.post('/:groupId/invite', verifyToken, inviteToGroup);

router.get('/:groupId/join-requests', verifyToken, getJoinRequests);
router.post('/:groupId/join-requests/:requestUserId', verifyToken, handleJoinRequest);

router.get('/:groupId/pending-posts', verifyToken, getPendingPosts);
router.post('/:groupId/pending-posts/:postId', verifyToken, handlePendingPost);

module.exports = router;
