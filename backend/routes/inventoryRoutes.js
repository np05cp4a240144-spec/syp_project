const express = require('express');
const router = express.Router();
const { getInventory, getPartDetails, getInventoryLogs, addPart, updateStock, updatePart, requestRestock, purchaseParts } = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getInventory);
router.post('/purchase', protect, purchaseParts);
router.get('/logs', protect, getInventoryLogs);
router.get('/:id', protect, getPartDetails);
router.post('/', protect, admin, addPart);
router.post('/:id/request', protect, requestRestock);
router.put('/:id', protect, admin, updatePart);
router.put('/:id/stock', protect, admin, updateStock);

module.exports = router;
