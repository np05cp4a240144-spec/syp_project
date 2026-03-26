const express = require('express');
const router = express.Router();
const { addVehicle, removeVehicle, updateVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addVehicle);
router.delete('/:id', protect, removeVehicle);
router.put('/:id', protect, updateVehicle);

module.exports = router;
