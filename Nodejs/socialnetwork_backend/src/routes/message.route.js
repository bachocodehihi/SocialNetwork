const express = require('express');
const router = express.Router();
const { 
    createConversation, 
    getConversations, 
    getMessages, 
    sendMessage,
    deleteMessage,
    markAsRead
} = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, createConversation);
router.get('/', verifyToken, getConversations);

router.get('/:conversationId/messages', verifyToken, getMessages);
router.post('/:conversationId/send', verifyToken, sendMessage);
router.delete('/message/:messageId', verifyToken, deleteMessage);
router.post('/:conversationId/read', verifyToken, markAsRead);

module.exports = router;