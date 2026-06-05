const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');

router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.get('/:requestId', getPaymentDetails);

module.exports = router;
