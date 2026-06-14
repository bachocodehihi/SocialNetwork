const express = require('express');
const router = express.Router();
const { 
    createConversation, 
    getConversations, 
    getMessages, 
    sendMessage,
    deleteMessage,
    markAsRead,
    uploadMessageImage,
    uploadMessageAudio
} = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');
const multer = require('multer');
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyToken, createConversation);
router.get('/', verifyToken, getConversations);

router.get('/:conversationId/messages', verifyToken, getMessages);
router.post('/:conversationId/send', verifyToken, sendMessage);
router.delete('/message/:messageId', verifyToken, deleteMessage);
router.post('/:conversationId/read', verifyToken, markAsRead);
router.post('/upload-image', verifyToken, upload.single('image'), uploadMessageImage);
router.post('/upload-audio', verifyToken, memoryUpload.single('audio'), uploadMessageAudio);

module.exports = router;