const express = require('express');
const router = express.Router();
const { 
    sendOtp, 
    checkEmail, 
    register, 
    verifyOtp, 
    login, 
    forgotPassword,
    generateQRCode,
    checkQRStatus,
    confirmQRLogin,
    googleLogin
} = require('../controllers/auth.controller');

router.post('/check-email', checkEmail);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/qr/generate', generateQRCode);
router.get('/qr/status/:sessionId', checkQRStatus);
router.post('/qr/confirm', confirmQRLogin);
router.post('/google-login', googleLogin);
module.exports = router;
