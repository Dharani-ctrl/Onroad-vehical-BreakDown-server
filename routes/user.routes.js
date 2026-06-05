const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getVehicles, addVehicle, updateVehicle, deleteVehicle, getRequests, getActiveRequest, getRequestById, addReview, getPayments, payRequest, requestRefund } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);
router.get('/requests', getRequests);
router.get('/requests/active', getActiveRequest);
router.get('/requests/:id', getRequestById);
router.post('/requests/:id/review', addReview);
router.get('/payments', getPayments);
router.post('/requests/:id/pay', payRequest);
router.post('/requests/:id/refund', requestRefund);

module.exports = router;
