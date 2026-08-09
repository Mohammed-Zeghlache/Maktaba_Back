// const Book = require('../models/Book');
// const Wishlist = require('../models/Wishlist');

// // GET /api/books — public list, approved books only, with filters + pagination
// exports.list = async (req, res, next) => {
//   try {
//     const { major, university, year, exchange, search, city, sort, page, limit, semester } = req.query;
//     const filters = { major, university, year, exchange, search, city, sort, semester, status: 'approved' };
//     const data = await Book.findAll(filters, page, limit);
//     res.json(data);
//   } catch (err) { next(err); }
// };

// exports.getOne = async (req, res, next) => {
//   try {
//     console.log("Book ID:", req.params.id);

//     if (!req.params.id || isNaN(req.params.id)) {
//       return res.status(400).json({ error: "Invalid book ID" });
//     }

//     const book = await Book.findById(Number(req.params.id));

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     const isOwner = req.user && req.user.role === "user" && req.user.id === book.user_id;
//     const isAdmin = req.user && req.user.role === "admin";

//     if (book.status !== "approved" && !isOwner && !isAdmin) {
//       return res.status(403).json({ error: "This book is not currently available" });
//     }

//     if (book.status === "approved") {
//       await Book.incrementViews(book.id);
//     }

//     let wishlisted = false;
//     if (req.user && req.user.role === "user") {
//       wishlisted = await Wishlist.isWishlisted(req.user.id, book.id);
//     }

//     res.json({ ...book, wishlisted });
//   } catch (err) {
//     next(err);
//   }
// };




// // POST /api/books — auth required, always starts as 'pending'
// exports.create = async (req, res, next) => {
//   try {
//     const b = req.body;
//     if (!b.majorKey || !b.universityKey || !b.yearKey || !b.semester || !b.conditionKey || !b.exchangeKey || !b.phone) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
//     const book = await Book.create({ ...b, userId: req.user.id, status: 'pending' });
//     res.status(201).json(book);
//   } catch (err) { next(err); }
// };

// // PUT /api/books/:id — owner only, resets status to 'pending' for re-review
// exports.update = async (req, res, next) => {
//   try {
//     const existing = await Book.findById(req.params.id);
//     if (!existing) return res.status(404).json({ error: 'Book not found' });
//     if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

//     const updated = await Book.update(req.params.id, { ...req.body, status: 'pending' });
//     res.json(updated);
//   } catch (err) { next(err); }
// };

// // DELETE /api/books/:id — owner or admin
// exports.remove = async (req, res, next) => {
//   try {
//     const existing = await Book.findById(req.params.id);
//     if (!existing) return res.status(404).json({ error: 'Book not found' });
//     if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Not your listing' });
//     }
//     await Book.delete(req.params.id);
//     res.json({ success: true });
//   } catch (err) { next(err); }
// };

// // GET /api/books/my/books — auth required
// exports.myBooks = async (req, res, next) => {
//   try {
//     const books = await Book.findByUser(req.user.id);
//     res.json(books);
//   } catch (err) { next(err); }
// };

// // GET /api/books/wishlist — auth required
// exports.getWishlist = async (req, res, next) => {
//   try {
//     const books = await Wishlist.findByUser(req.user.id);
//     res.json(books);
//   } catch (err) { next(err); }
// };

// // POST /api/books/wishlist/:id — auth required, toggles on/off
// exports.toggleWishlist = async (req, res, next) => {
//   try {
//     const action = await Wishlist.toggle(req.user.id, req.params.id);
//     res.json({ action });
//   } catch (err) { next(err); }
// };

// // POST /api/books/upload — optional real file-upload path (multer).
// // The current frontend sends images as base64 strings in the JSON body instead,
// // so this endpoint is available for when you want to switch to real file uploads.
// exports.uploadImages = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
//     const urls = req.files.map((f) => `/uploads/${f.filename}`);
//     res.json({ urls });
//   } catch (err) { next(err); }
// };








const db = require('../config/db');

// ========================================================
// GET WISHLIST
// ========================================================
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
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

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

// ========================================================
// TOGGLE WISHLIST (Add/Remove)
// ========================================================
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    // Check if book exists
    const bookCheck = await db.query('SELECT id FROM books WHERE id = $1', [bookId]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if already in wishlist
    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    if (existing.rows.length > 0) {
      // Remove from wishlist
      await db.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
        [userId, bookId]
      );
      return res.json({ 
        success: true, 
        action: 'removed',
        message: 'Book removed from wishlist' 
      });
    } else {
      // Add to wishlist
      await db.query(
        'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)',
        [userId, bookId]
      );
      return res.json({ 
        success: true, 
        action: 'added',
        message: 'Book added to wishlist' 
      });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
};

// ========================================================
// GET MY BOOKS
// ========================================================
const getMyBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT b.*, 
        json_agg(DISTINCT bi.image_url) FILTER (WHERE bi.image_url IS NOT NULL) as images
       FROM books b
       LEFT JOIN book_images bi ON b.id = bi.book_id
       WHERE b.user_id = $1
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching my books:', error);
    res.status(500).json({ error: 'Failed to fetch your books' });
  }
};

// ========================================================
// CREATE BOOK
// ========================================================
const createBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      titleAr, titleEn, descAr, descEn,
      authorAr, authorEn, ownerAr, ownerEn,
      universityKey, majorKey, yearKey, semester,
      cityAr, cityEn, conditionKey, exchangeKey,
      price, phone, images = []
    } = req.body;

    const result = await db.query(
      `INSERT INTO books (
        user_id, title_ar, title_en, desc_ar, desc_en,
        author_ar, author_en, owner_ar, owner_en,
        university_key, major_key, year_key, semester,
        city_ar, city_en, condition_key, exchange_key,
        price, phone, images, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending')
      RETURNING *`,
      [
        userId, titleAr, titleEn, descAr, descEn,
        authorAr, authorEn, ownerAr, ownerEn,
        universityKey, majorKey, yearKey, semester,
        cityAr, cityEn, conditionKey, exchangeKey,
        price, phone, JSON.stringify(images)
      ]
    );

    // Insert images into book_images table if provided
    if (images && images.length > 0) {
      const bookId = result.rows[0].id;
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO book_images (book_id, image_url, "order") VALUES ($1, $2, $3)',
          [bookId, images[i], i]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
};

// ========================================================
// GET BOOK BY ID (with wishlist status)
// ========================================================
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    // Increment views
    await db.query('UPDATE books SET views = views + 1 WHERE id = $1', [id]);

    let result;
    if (userId) {
      result = await db.query(
        `SELECT b.*, 
          json_agg(DISTINCT bi.image_url) FILTER (WHERE bi.image_url IS NOT NULL) as images,
          EXISTS (
            SELECT 1 FROM wishlist w 
            WHERE w.book_id = b.id AND w.user_id = $2
          ) as wishlisted
         FROM books b
         LEFT JOIN book_images bi ON b.id = bi.book_id
         WHERE b.id = $1
         GROUP BY b.id`,
        [id, userId]
      );
    } else {
      result = await db.query(
        `SELECT b.*, 
          json_agg(DISTINCT bi.image_url) FILTER (WHERE bi.image_url IS NOT NULL) as images,
          false as wishlisted
         FROM books b
         LEFT JOIN book_images bi ON b.id = bi.book_id
         WHERE b.id = $1
         GROUP BY b.id`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

// ========================================================
// GET ALL BOOKS (with filters)
// ========================================================
const getBooks = async (req, res) => {
  try {
    const {
      search, major, university, year, semester,
      exchange, city, sort = 'newest',
      page = 1, limit = 12
    } = req.query;

    const userId = req.user ? req.user.id : null;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
        json_agg(DISTINCT bi.image_url) FILTER (WHERE bi.image_url IS NOT NULL) as images
    `;
    
    if (userId) {
      query += `,
        EXISTS (
          SELECT 1 FROM wishlist w 
          WHERE w.book_id = b.id AND w.user_id = $${Object.keys(req.query).length + 1}
        ) as wishlisted
      `;
    } else {
      query += `,
        false as wishlisted
      `;
    }

    query += ` FROM books b
      LEFT JOIN book_images bi ON b.id = bi.book_id
      WHERE b.status = 'approved'
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (b.title_ar ILIKE $${paramIndex} OR b.title_en ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (major) {
      query += ` AND b.major_key = $${paramIndex}`;
      params.push(major);
      paramIndex++;
    }

    if (university) {
      query += ` AND b.university_key = $${paramIndex}`;
      params.push(university);
      paramIndex++;
    }

    if (year) {
      query += ` AND b.year_key = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (semester) {
      query += ` AND b.semester = $${paramIndex}`;
      params.push(semester);
      paramIndex++;
    }

    if (exchange) {
      query += ` AND b.exchange_key = $${paramIndex}`;
      params.push(exchange);
      paramIndex++;
    }

    if (city) {
      query += ` AND (b.city_ar ILIKE $${paramIndex} OR b.city_en ILIKE $${paramIndex})`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    query += ` GROUP BY b.id `;

    // Sorting
    switch (sort) {
      case 'oldest':
        query += ` ORDER BY b.created_at ASC`;
        break;
      case 'priceAsc':
        query += ` ORDER BY b.price ASC NULLS LAST`;
        break;
      case 'priceDesc':
        query += ` ORDER BY b.price DESC NULLS LAST`;
        break;
      case 'popular':
        query += ` ORDER BY b.views DESC`;
        break;
      default:
        query += ` ORDER BY b.created_at DESC`;
    }

    // Add user_id for wishlist check
    if (userId) {
      params.push(userId);
    }

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM books WHERE status = 'approved'`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (title_ar ILIKE $${countParams.length + 1} OR title_en ILIKE $${countParams.length + 1})`;
      countParams.push(`%${search}%`);
    }
    if (major) {
      countQuery += ` AND major_key = $${countParams.length + 1}`;
      countParams.push(major);
    }
    if (university) {
      countQuery += ` AND university_key = $${countParams.length + 1}`;
      countParams.push(university);
    }
    if (year) {
      countQuery += ` AND year_key = $${countParams.length + 1}`;
      countParams.push(year);
    }
    if (semester) {
      countQuery += ` AND semester = $${countParams.length + 1}`;
      countParams.push(semester);
    }
    if (exchange) {
      countQuery += ` AND exchange_key = $${countParams.length + 1}`;
      countParams.push(exchange);
    }
    if (city) {
      countQuery += ` AND (city_ar ILIKE $${countParams.length + 1} OR city_en ILIKE $${countParams.length + 1})`;
      countParams.push(`%${city}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      books: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getMyBooks,
  getWishlist,
  toggleWishlist,
};
