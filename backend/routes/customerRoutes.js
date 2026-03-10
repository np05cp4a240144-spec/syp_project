const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAdminStats, getAllCustomers } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/admin-stats', protect, getAdminStats);
router.get('/all', protect, getAllCustomers);

module.exports = router;
