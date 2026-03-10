const express = require('express');
const router = express.Router();
const {
	getMessages,
	getRecentChats,
	getUnreadMessageCount,
	markConversationRead,
	startPaymentSupport,
	sendPaymentSupportMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMessages);
router.get('/recent', protect, getRecentChats);
router.get('/unread-count', protect, getUnreadMessageCount);
router.patch('/read', protect, markConversationRead);
router.post('/payment-support/start', protect, startPaymentSupport);
router.post('/payment-support/send', protect, sendPaymentSupportMessage);

module.exports = router;
