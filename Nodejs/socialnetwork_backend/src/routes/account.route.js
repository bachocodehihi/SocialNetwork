const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    searchUsers, 
    getUserById,
    saveFcmToken,   
    removeFcmToken,
    addAddress,
    addPhone,
    addJob,
    addNationality,
    requestDeleteAccount,
    cancelDeleteAccount,
    reportUser,
    appealBan,
    getPrivacy,
    updatePrivacy,
    getSearchHistory,
    saveSearchHistory,
    deleteSearchHistory,
    clearSearchHistory,
} = require('../controllers/account.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.get('/search', verifyToken, searchUsers);
router.get('/user/:id', verifyToken, getUserById);
router.post('/fcm-token', verifyToken, saveFcmToken);
router.post('/remove-fcm-token', verifyToken, removeFcmToken);

router.get('/privacy', verifyToken, getPrivacy);
router.put('/privacy', verifyToken, updatePrivacy);

router.post('/add-address', verifyToken, addAddress);
router.post('/add-phone', verifyToken, addPhone);
router.post('/add-job', verifyToken, addJob);
router.post('/add-nationality', verifyToken, addNationality);
router.get('/activity', verifyToken, require('../controllers/account.controller').getActivity);

router.post('/delete', verifyToken, requestDeleteAccount);
router.post('/cancel-delete', verifyToken, cancelDeleteAccount);
router.post('/report', verifyToken, reportUser);
router.post('/appeal', verifyToken, appealBan);

router.get('/search-history', verifyToken, getSearchHistory);
router.post('/search-history', verifyToken, saveSearchHistory);
router.delete('/search-history/:searchedUserId', verifyToken, deleteSearchHistory);
router.delete('/search-history', verifyToken, clearSearchHistory);

module.exports = router;
