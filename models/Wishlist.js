// const pool = require('../config/db');

// const Wishlist = {
//   async toggle(userId, bookId) {
//     const existing = await pool.query(
//       'SELECT id FROM wishlists WHERE user_id = $1 AND book_id = $2',
//       [userId, bookId]
//     );
//     if (existing.rows.length) {
//       await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
//       return 'removed';
//     }
//     await pool.query('INSERT INTO wishlists (user_id, book_id) VALUES ($1,$2)', [userId, bookId]);
//     return 'added';
//   },

//   async findByUser(userId) {
//     const { rows } = await pool.query(
//       `SELECT b.* FROM wishlists w
//        JOIN books b ON b.id = w.book_id
//        WHERE w.user_id = $1
//        ORDER BY w.joined_date DESC`,
//       [userId]
//     );
//     return rows;
//   },

//   async isWishlisted(userId, bookId) {
//     const { rows } = await pool.query(
//       'SELECT 1 FROM wishlists WHERE user_id = $1 AND book_id = $2',
//       [userId, bookId]
//     );
//     return rows.length > 0;
//   },
// };

// module.exports = Wishlist;


const db = require('../config/db');

const Wishlist = {
  // Find all wishlisted books for a user
  async findByUser(userId) {
    const { rows } = await db.query(
      `SELECT b.*, 
        json_agg(DISTINCT bi.image_url) FILTER (WHERE bi.image_url IS NOT NULL) as images
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       LEFT JOIN book_images bi ON b.id = bi.book_id
       WHERE w.user_id = $1 AND b.status = 'approved'
       GROUP BY b.id
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Check if a book is in user's wishlist
  async isWishlisted(userId, bookId) {
    const { rows } = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    return rows.length > 0;
  },

  // Toggle wishlist (add/remove)
  async toggle(userId, bookId) {
    // Check if exists
    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    if (existing.rows.length > 0) {
      // Remove
      await db.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
        [userId, bookId]
      );
      return 'removed';
    } else {
      // Add
      await db.query(
        'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)',
        [userId, bookId]
      );
      return 'added';
    }
  },

  // Add to wishlist
  async add(userId, bookId) {
    await db.query(
      'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, bookId]
    );
  },

  // Remove from wishlist
  async remove(userId, bookId) {
    await db.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
  }
};

module.exports = Wishlist;
