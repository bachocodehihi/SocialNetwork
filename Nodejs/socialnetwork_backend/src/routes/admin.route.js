const express = require('express');
const router = express.Router();
const { getBannedUsers, resolveAppeal } = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/banned-users', verifyToken, isAdmin, getBannedUsers);
router.post('/resolve-appeal', verifyToken, isAdmin, resolveAppeal);

module.exports = router;
