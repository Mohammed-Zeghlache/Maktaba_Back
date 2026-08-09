const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  getMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/contactController');

// Public route - anyone can send a message
router.post('/', sendMessage);

// Admin only routes
router.get('/', auth, getMessages);
router.get('/:id', auth, getMessage);
router.put('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteMessage);

module.exports = router;
