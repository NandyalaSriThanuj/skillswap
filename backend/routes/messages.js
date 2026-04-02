// routes/messages.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  getMessages, sendMessage, 
  getNotifications, markNotificationsRead 
} = require('../controllers/messageController');

router.use(authMiddleware);

router.get('/notifications', getNotifications);              // GET notifications
router.put('/notifications/read', markNotificationsRead);    // PUT mark as read
router.get('/:exchangeId', getMessages);                     // GET messages for exchange
router.post('/:exchangeId', sendMessage);                    // POST send message

module.exports = router;
