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
    getGroupByInviteCode
} = require('../controllers/group.controller');

router.get('/', verifyToken, getGroups);
router.get('/invite/:inviteCode', verifyToken, getGroupByInviteCode);
router.get('/:groupId', verifyToken, getGroupById);
router.post('/', verifyToken, createGroup);
router.put('/:groupId', verifyToken, updateGroup);
router.delete('/:groupId', verifyToken, deleteGroup);
router.post('/join-qr', verifyToken, joinByQR);
router.post('/:groupId/members', verifyToken, addMember);      
router.delete('/:groupId/members/:memberId', verifyToken, removeMember);
router.post('/:groupId/invite', verifyToken, inviteToGroup);

module.exports = router;
