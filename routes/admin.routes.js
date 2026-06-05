const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getStats, getUsers, getUserById, addUser, updateUser, blockUser, unblockUser, deleteUser,
  getWorkshops, getWorkshopById, addWorkshop, updateWorkshop, approveWorkshop, rejectWorkshop, blockWorkshop, unblockWorkshop, deleteWorkshop,
  getRequests, getRequestById, assignWorkshop, cancelRequest,
  getCategories, addCategory, updateCategory, deleteCategory,
  getRevenueReport, getRequestsReport,
  getAdminProfile, updateAdminProfile
} = require('../controllers/adminController');

// Stats
router.get('/stats', getStats);

// Users
router.post('/users', addUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

// Workshops
router.post('/workshops', addWorkshop);
router.get('/workshops', getWorkshops);
router.get('/workshops/:id', getWorkshopById);
router.put('/workshops/:id', updateWorkshop);
router.put('/workshops/:id/approve', approveWorkshop);
router.put('/workshops/:id/reject', rejectWorkshop);
router.put('/workshops/:id/block', blockWorkshop);
router.put('/workshops/:id/unblock', unblockWorkshop);
router.delete('/workshops/:id', deleteWorkshop);

// Requests
router.get('/requests', getRequests);
router.get('/requests/:id', getRequestById);
router.put('/requests/:id/assign', assignWorkshop);
router.put('/requests/:id/cancel', cancelRequest);

// Categories
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Reports
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/requests', getRequestsReport);

// Admin Profile (needs auth)
router.get('/profile', verifyToken, getAdminProfile);
router.put('/profile', verifyToken, updateAdminProfile);

module.exports = router;
