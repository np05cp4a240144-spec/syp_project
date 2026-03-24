const express = require('express');
const router = express.Router();
const { register, login, getUserById, getAllUsers, updateUserRole } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', protect, getUserById);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
