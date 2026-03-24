const express = require('express');
const router = express.Router();
const { getMechanics, createMechanic, updateMechanic, deleteMechanic, getMechanicProfile, updateMechanicProfile } = require('../controllers/mechanicController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getMechanicProfile)
    .put(protect, updateMechanicProfile);

router.route('/')
    .get(protect, admin, getMechanics)
    .post(protect, admin, createMechanic);

router.route('/:id')
    .put(protect, admin, updateMechanic)
    .delete(protect, admin, deleteMechanic);

module.exports = router;
