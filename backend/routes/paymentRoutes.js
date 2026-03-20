const express = require('express');
const router = express.Router();
const { initiateKhaltiPayment, verifyKhaltiPayment, getAdminPaymentNotifications } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiateKhaltiPayment);
router.get('/verify', verifyKhaltiPayment);
router.get('/admin/notifications', protect, admin, getAdminPaymentNotifications);

module.exports = router;
