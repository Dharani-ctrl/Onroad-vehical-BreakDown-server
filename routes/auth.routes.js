const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword, getMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', getMe);

module.exports = router;
