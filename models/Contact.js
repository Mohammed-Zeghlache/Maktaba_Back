const db = require('../config/db');

const Contact = {
  // Save contact message
  async create({ fullName, email, subject, message }) {
    console.log('💾 Creating contact in database:', { fullName, email, subject });
    const { rows } = await db.query(
      `INSERT INTO contacts (full_name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, subject, message, is_read, created_at`,
      [fullName, email, subject, message]
    );
    console.log('✅ Contact created:', rows[0]);
    return rows[0];
  },

  // Get all messages (for admin)
  async findAll() {
    console.log('📖 Fetching all contacts');
    const { rows } = await db.query(
      `SELECT * FROM contacts ORDER BY created_at DESC`
    );
    return rows;
  },

  // Get single message by ID
  async findById(id) {
    console.log(`📖 Fetching contact ${id}`);
    const { rows } = await db.query(
      'SELECT * FROM contacts WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  // Mark message as read
  async markAsRead(id) {
    console.log(`📖 Marking contact ${id} as read`);
    const { rows } = await db.query(
      'UPDATE contacts SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  },

  // Delete message
  async delete(id) {
    console.log(`🗑️ Deleting contact ${id}`);
    await db.query('DELETE FROM contacts WHERE id = $1', [id]);
  }
};

module.exports = Contact;
