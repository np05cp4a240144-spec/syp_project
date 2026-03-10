const express = require('express');
const router = express.Router();
const { createInvoice, getInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:appointmentId', protect, createInvoice);
router.get('/:appointmentId', protect, getInvoice);

module.exports = router;
