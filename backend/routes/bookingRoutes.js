const express = require('express');
const router = express.Router();
const { createBooking, getCustomerBookings, getMechanicJobs, getAllBookings, updateBookingStatus, deleteBooking, getRevenueStats } = require('../controllers/bookingController');
const { getJobParts, addPartToJob, removePartFromJob } = require('../controllers/jobPartController');
const { getJobUpdates, addJobUpdate } = require('../controllers/jobUpdateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getCustomerBookings);
router.get('/mechanic', protect, getMechanicJobs);
router.get('/admin', protect, getAllBookings);
router.get('/revenue', protect, getRevenueStats);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

// Job Parts
router.get('/:id/parts', protect, getJobParts);
router.post('/:id/parts', protect, addPartToJob);
router.delete('/parts/:id', protect, removePartFromJob);

// Job Updates
router.get('/:id/updates', protect, getJobUpdates);
router.post('/:id/updates', protect, addJobUpdate);

module.exports = router;
