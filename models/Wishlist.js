const pool = require('../config/db');

const Wishlist = {
  async toggle(userId, bookId) {
    const existing = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    if (existing.rows.length) {
      await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
      return 'removed';
    }
    await pool.query('INSERT INTO wishlists (user_id, book_id) VALUES ($1,$2)', [userId, bookId]);
    return 'added';
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT b.* FROM wishlists w
       JOIN books b ON b.id = w.book_id
       WHERE w.user_id = $1
       ORDER BY w.joined_date DESC`,
      [userId]
    );
    return rows;
  },

  async isWishlisted(userId, bookId) {
    const { rows } = await pool.query(
      'SELECT 1 FROM wishlists WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    return rows.length > 0;
  },
};

module.exports = Wishlist;