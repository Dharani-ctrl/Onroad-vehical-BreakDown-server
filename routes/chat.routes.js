const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');

router.get('/:requestId', getMessages);
router.post('/:requestId', sendMessage);

module.exports = router;
