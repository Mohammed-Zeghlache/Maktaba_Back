const db = require('../config/db');

const Wishlist = {
  
  async findByUser(userId) {
    try {
      const { rows } = await db.query(
        `SELECT 
          b.*,
          b.images as images
         FROM wishlist w
         JOIN books b ON w.book_id = b.id
         WHERE w.user_id = $1
         ORDER BY w.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in Wishlist.findByUser:', error);
      throw error;
    }
  },

  // Check if a book is in user's wishlist
  async isWishlisted(userId, bookId) {
    try {
      const { rows } = await db.query(
        'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
        [userId, bookId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error in Wishlist.isWishlisted:', error);
      return false;
    }
  },

  // Toggle wishlist (add/remove)
  async toggle(userId, bookId) {
    try {
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
    } catch (error) {
      console.error('Error in Wishlist.toggle:', error);
      throw error;
    }
  },

  // Add to wishlist
  async add(userId, bookId) {
    try {
      await db.query(
        'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, bookId]
      );
    } catch (error) {
      console.error('Error in Wishlist.add:', error);
      throw error;
    }
  },

  // Remove from wishlist
  async remove(userId, bookId) {
    try {
      await db.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
        [userId, bookId]
      );
    } catch (error) {
      console.error('Error in Wishlist.remove:', error);
      throw error;
    }
  }
};

module.exports = Wishlist;
