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


// const db = require('../config/db');

// const Wishlist = {
//   // Find all wishlisted books for a user
//   async findByUser(userId) {
//     try {
//       const { rows } = await db.query(
//         `SELECT b.*, 
//           COALESCE(
//             (SELECT json_agg(bi.image_url) 
//              FROM book_images bi 
//              WHERE bi.book_id = b.id),
//             '[]'::json
//           ) as images
//          FROM wishlist w
//          JOIN books b ON w.book_id = b.id
//          WHERE w.user_id = $1 AND b.status = 'approved'
//          ORDER BY w.created_at DESC`,
//         [userId]
//       );
//       return rows;
//     } catch (error) {
//       console.error('Error in Wishlist.findByUser:', error);
//       throw error;
//     }
//   },

//   // Check if a book is in user's wishlist
//   async isWishlisted(userId, bookId) {
//     try {
//       const { rows } = await db.query(
//         'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
//         [userId, bookId]
//       );
//       return rows.length > 0;
//     } catch (error) {
//       console.error('Error in Wishlist.isWishlisted:', error);
//       return false;
//     }
//   },

//   // Toggle wishlist (add/remove)
//   async toggle(userId, bookId) {
//     try {
//       // Check if exists
//       const existing = await db.query(
//         'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
//         [userId, bookId]
//       );

//       if (existing.rows.length > 0) {
//         // Remove
//         await db.query(
//           'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
//           [userId, bookId]
//         );
//         return 'removed';
//       } else {
//         // Add
//         await db.query(
//           'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)',
//           [userId, bookId]
//         );
//         return 'added';
//       }
//     } catch (error) {
//       console.error('Error in Wishlist.toggle:', error);
//       throw error;
//     }
//   },

//   // Add to wishlist
//   async add(userId, bookId) {
//     try {
//       await db.query(
//         'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
//         [userId, bookId]
//       );
//     } catch (error) {
//       console.error('Error in Wishlist.add:', error);
//       throw error;
//     }
//   },

//   // Remove from wishlist
//   async remove(userId, bookId) {
//     try {
//       await db.query(
//         'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
//         [userId, bookId]
//       );
//     } catch (error) {
//       console.error('Error in Wishlist.remove:', error);
//       throw error;
//     }
//   }
// };

// module.exports = Wishlist;





const db = require('../config/db');

const Wishlist = {
  // Find all wishlisted books for a user
  async findByUser(userId) {
    try {
      const { rows } = await db.query(
        `SELECT b.*, 
          COALESCE(
            (SELECT json_agg(bi.image_url) 
             FROM book_images bi 
             WHERE bi.book_id = b.id),
            '[]'::json
          ) as images
         FROM wishlist w
         JOIN books b ON w.book_id = b.id
         WHERE w.user_id = $1
         ORDER BY w.created_at DESC`,
        [userId]
      );
      console.log('📚 Wishlist found:', rows.length, 'books');
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
      const existing = await db.query(
        'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
        [userId, bookId]
      );

      if (existing.rows.length > 0) {
        await db.query(
          'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
          [userId, bookId]
        );
        return 'removed';
      } else {
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
  }
};

module.exports = Wishlist;
