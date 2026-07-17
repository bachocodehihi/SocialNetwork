const express = require('express');
const router = express.Router();
const { 
    createPost, 
    getFeed, 
    likePost, 
    commentPost, 
    getUserPosts, 
    getGroupPosts,
    likeComment,
    likeReply,
    replyComment,
    toggleComments
} = require('../controllers/content.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/', verifyToken, upload.array('images', 10), createPost);
router.get('/', verifyToken, getFeed);
router.get('/user/:userId', verifyToken, getUserPosts);
router.get('/group/:groupId', verifyToken, getGroupPosts);
router.put('/:id/like', verifyToken, likePost);
router.post('/:id/comment', verifyToken, commentPost);
router.put('/:id/toggle-comments', verifyToken, toggleComments);

router.put('/comment/:commentId/like', verifyToken, likeComment);
router.put('/comment/:commentId/reply/:replyId/like', verifyToken, likeReply);
router.post('/:id/comment/:commentId/reply', verifyToken, replyComment);

module.exports = router;
