const pool = require('../config/db');

const User = {
  async create({ firstName, lastName, email, phone, passwordHash, universityKey, majorKey }) {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, university_key, major_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, first_name, last_name, email, phone, university_key, major_key, is_banned, joined_date`,
      [firstName, lastName, email, phone, passwordHash, universityKey || '', majorKey || '']
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findByEmailOrPhone(email, phone) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, phone, university_key, major_key, is_banned, joined_date
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.university_key, u.major_key,
             u.is_banned, u.joined_date,
             (SELECT COUNT(*) FROM books b WHERE b.user_id = u.id) AS listings_count
      FROM users u
      ORDER BY u.joined_date DESC
    `);
    return rows;
  },

  async setBanned(id, banned) {
    const { rows } = await pool.query(
      'UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING id, first_name, last_name, is_banned',
      [banned, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },
};

module.exports = User;