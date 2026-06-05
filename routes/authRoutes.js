const express = require('express');
const router = express.Router();
const { registerUser, registerWorkshop, login, logout, getMe } = require('../controllers/authController');

router.post('/register/user', registerUser);
router.post('/register/workshop', registerWorkshop);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);

module.exports = router;
