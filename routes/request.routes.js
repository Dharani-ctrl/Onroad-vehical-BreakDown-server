const express = require('express');
const router = express.Router();
const { createRequest, cancelRequest, getNearbyWorkshops } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', createRequest);
router.put('/:id/cancel', cancelRequest);
router.get('/:id/workshops', getNearbyWorkshops);

module.exports = router;
