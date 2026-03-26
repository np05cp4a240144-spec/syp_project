const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAdminStats, getAllCustomers, deleteCustomer } = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/admin-stats', protect, admin, getAdminStats);
router.get('/all', protect, admin, getAllCustomers);
router.delete('/:id', protect, admin, deleteCustomer);

module.exports = router;
