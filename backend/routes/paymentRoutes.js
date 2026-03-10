const express = require('express');
const router = express.Router();
const { initiateKhaltiPayment, verifyKhaltiPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiateKhaltiPayment);
router.get('/verify', verifyKhaltiPayment);

module.exports = router;
