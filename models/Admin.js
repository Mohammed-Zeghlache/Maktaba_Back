const pool = require('../config/db');

const Admin = {
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, joined_date FROM admins WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async create({ firstName, lastName, email, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO admins (first_name, last_name, email, password_hash)
       VALUES ($1,$2,$3,$4)
       RETURNING id, first_name, last_name, email, joined_date`,
      [firstName, lastName, email, passwordHash]
    );
    return rows[0];
  },
};

module.exports = Admin;