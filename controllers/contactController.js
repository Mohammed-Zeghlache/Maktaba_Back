const Contact = require('../models/Contact');

// ========================================================
// POST /api/contact - Send contact message
// ========================================================
exports.sendMessage = async (req, res, next) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Save to database
    const contact = await Contact.create({
      fullName,
      email,
      subject,
      message
    });

    // TODO: Send email notification to admin (optional)
    // await sendEmailNotification(contact);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ========================================================
// GET /api/contact - Get all messages (Admin only)
// ========================================================
exports.getMessages = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const messages = await Contact.findAll();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// ========================================================
// GET /api/contact/:id - Get single message (Admin only)
// ========================================================
exports.getMessage = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
};

// ========================================================
// PUT /api/contact/:id/read - Mark as read (Admin only)
// ========================================================
exports.markAsRead = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const message = await Contact.markAsRead(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, message: 'Marked as read', data: message });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ========================================================
// DELETE /api/contact/:id - Delete message (Admin only)
// ========================================================
exports.deleteMessage = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await Contact.delete(req.params.id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
