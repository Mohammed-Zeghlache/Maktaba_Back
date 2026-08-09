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



const Book = require('../models/Book');
const Wishlist = require('../models/Wishlist');

// ========================================================
// GET /api/books — public list, approved books only
// ========================================================
exports.list = async (req, res, next) => {
  try {
    const { major, university, year, exchange, search, city, sort, page, limit, semester } = req.query;
    const filters = { major, university, year, exchange, search, city, sort, semester, status: 'approved' };
    const data = await Book.findAll(filters, page, limit);
    res.json(data);
  } catch (err) { next(err); }
};

// ========================================================
// GET /api/books/:id — get single book
// ========================================================
exports.getOne = async (req, res, next) => {
  try {
    console.log("Book ID:", req.params.id);

    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const book = await Book.findById(Number(req.params.id));

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const isOwner = req.user && req.user.role === "user" && req.user.id === book.user_id;
    const isAdmin = req.user && req.user.role === "admin";

    if (book.status !== "approved" && !isOwner && !isAdmin) {
      return res.status(403).json({ error: "This book is not currently available" });
    }

    if (book.status === "approved") {
      await Book.incrementViews(book.id);
    }

    let wishlisted = false;
    if (req.user && req.user.role === "user") {
      wishlisted = await Wishlist.isWishlisted(req.user.id, book.id);
    }

    res.json({ ...book, wishlisted });
  } catch (err) {
    next(err);
  }
};

// ========================================================
// POST /api/books — auth required, always starts as 'pending'
// ========================================================
exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.majorKey || !b.universityKey || !b.yearKey || !b.semester || !b.conditionKey || !b.exchangeKey || !b.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const book = await Book.create({ ...b, userId: req.user.id, status: 'pending' });
    res.status(201).json(book);
  } catch (err) { next(err); }
};

// ========================================================
// PUT /api/books/:id — owner only, resets status to 'pending'
// ========================================================
exports.update = async (req, res, next) => {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Book not found' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    const updated = await Book.update(req.params.id, { ...req.body, status: 'pending' });
    res.json(updated);
  } catch (err) { next(err); }
};

// ========================================================
// DELETE /api/books/:id — owner or admin
// ========================================================
exports.remove = async (req, res, next) => {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Book not found' });
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your listing' });
    }
    await Book.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ========================================================
// GET /api/books/my/books — auth required
// ========================================================
exports.myBooks = async (req, res, next) => {
  try {
    const books = await Book.findByUser(req.user.id);
    res.json(books);
  } catch (err) { next(err); }
};

// ========================================================
// GET /api/books/wishlist — auth required
// ========================================================
exports.getWishlist = async (req, res, next) => {
  try {
    const books = await Wishlist.findByUser(req.user.id);
    res.json(books);
  } catch (err) { next(err); }
};

// ========================================================
// POST /api/books/wishlist/:id — auth required, toggles on/off
// ========================================================
exports.toggleWishlist = async (req, res, next) => {
  try {
    const action = await Wishlist.toggle(req.user.id, req.params.id);
    res.json({ action });
  } catch (err) { next(err); }
};

// ========================================================
// POST /api/books/upload — file upload (optional)
// ========================================================
exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) { next(err); }
};
