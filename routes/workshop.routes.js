const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword, toggleAvailability, updateLocation, getIncomingRequests, acceptRequest, declineRequest, updateJobStatus, updateETA, completeJob, getHistory, getEarnings, getActiveJob } = require('../controllers/workshopController');

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/availability', toggleAvailability);
router.put('/location', updateLocation);
router.get('/requests/incoming', getIncomingRequests);
router.get('/job/active', getActiveJob);
router.post('/request/:id/accept', acceptRequest);
router.post('/request/:id/decline', declineRequest);
router.put('/request/:id/status', updateJobStatus);
router.put('/request/:id/eta', updateETA);
router.post('/request/:id/complete', completeJob);
router.get('/history', getHistory);
router.get('/earnings', getEarnings);

module.exports = router;
