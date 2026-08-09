const db = require('../config/db');

const Contact = {
  // Save contact message
  async create({ fullName, email, subject, message }) {
    const { rows } = await db.query(
      `INSERT INTO contacts (full_name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, subject, message, created_at`,
      [fullName, email, subject, message]
    );
    return rows[0];
  },

  // Get all messages (for admin)
  async findAll() {
    const { rows } = await db.query(
      `SELECT * FROM contacts ORDER BY created_at DESC`
    );
    return rows;
  },

  // Get single message by ID
  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM contacts WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  // Mark message as read
  async markAsRead(id) {
    const { rows } = await db.query(
      'UPDATE contacts SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  },

  // Delete message
  async delete(id) {
    await db.query('DELETE FROM contacts WHERE id = $1', [id]);
  }
};

module.exports = Contact;
