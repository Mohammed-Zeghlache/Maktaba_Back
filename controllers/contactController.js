const Contact = require('../models/Contact');


exports.sendMessage = async (req, res, next) => {
  try {
    console.log('📩 1. Contact request received');
    console.log('📩 2. Request body:', req.body);

    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      console.log(' 3. Missing fields detected');
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ 4. Invalid email format:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    console.log('✅ 5. Validation passed, saving to database...');

    const contact = await Contact.create({
      fullName,
      email,
      subject,
      message
    });
    
    console.log('✅ 6. Contact saved successfully:', contact);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact
    });

  } catch (error) {
    console.error('❌ 7. Error saving contact:', error);
    console.error('❌ 8. Error details:', error.message);
    console.error('❌ 9. Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send message. Please try again later.' 
    });
  }
};


exports.getMessages = async (req, res, next) => {
  try {
    console.log('📩 Fetching all contact messages');

    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.' 
      });
    }

    const messages = await Contact.findAll();
    console.log(`✅ Found ${messages.length} messages`);
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch messages' 
    });
  }
};


exports.getMessage = async (req, res, next) => {
  try {
    console.log(`📩 Fetching message ID: ${req.params.id}`);

    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.' 
      });
    }

    const message = await Contact.findById(req.params.id);
    if (!message) {
      console.log(`❌ Message ${req.params.id} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Message not found' 
      });
    }

    console.log(`✅ Message ${req.params.id} found`);
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ Error fetching message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch message' 
    });
  }
};


exports.markAsRead = async (req, res, next) => {
  try {
    console.log(`📩 Marking message ${req.params.id} as read`);

    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.' 
      });
    }

    const message = await Contact.markAsRead(req.params.id);
    if (!message) {
      console.log(`❌ Message ${req.params.id} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Message not found' 
      });
    }

    console.log(`✅ Message ${req.params.id} marked as read`);
    res.json({ 
      success: true, 
      message: 'Marked as read', 
      data: message 
    });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark as read' 
    });
  }
};


exports.deleteMessage = async (req, res, next) => {
  try {
    console.log(`📩 Deleting message ${req.params.id}`);

    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.' 
      });
    }

    const message = await Contact.findById(req.params.id);
    if (!message) {
      console.log(`❌ Message ${req.params.id} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Message not found' 
      });
    }

    await Contact.delete(req.params.id);
    console.log(`✅ Message ${req.params.id} deleted`);
    res.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete message' 
    });
  }
};
