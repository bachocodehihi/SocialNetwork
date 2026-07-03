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
    uploadMessageAudio,
    uploadMessageFile,
    pinMessage,
    unpinMessage,
    editMessage,
    getLinkPreview
} = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');
const multer = require('multer');
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyToken, createConversation);
router.get('/', verifyToken, getConversations);

router.get('/link-preview', verifyToken, getLinkPreview);
router.get('/:conversationId/messages', verifyToken, getMessages);
router.post('/:conversationId/send', verifyToken, sendMessage);
router.delete('/message/:messageId', verifyToken, deleteMessage);
router.put('/message/:messageId', verifyToken, editMessage);
router.post('/:conversationId/read', verifyToken, markAsRead);
router.post('/upload-image', verifyToken, upload.single('image'), uploadMessageImage);
router.post('/upload-audio', verifyToken, memoryUpload.single('audio'), uploadMessageAudio);
router.post('/upload-file', verifyToken, memoryUpload.single('file'), uploadMessageFile);

router.post('/:conversationId/pin/:messageId', verifyToken, pinMessage);
router.post('/:conversationId/unpin', verifyToken, unpinMessage);

module.exports = router;