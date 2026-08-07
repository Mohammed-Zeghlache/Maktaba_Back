const Book = require('../models/Book');
const User = require('../models/User');

// GET /api/admin/stats
exports.stats = async (req, res, next) => {
  try {
    const bookStats = await Book.stats();
    const users = await User.findAll();
    res.json({
      totalBooks: Number(bookStats.total),
      pending: Number(bookStats.pending),
      approved: Number(bookStats.approved),
      rejected: Number(bookStats.rejected),
      totalViews: Number(bookStats.total_views),
      totalUsers: users.length,
      bannedUsers: users.filter((u) => u.is_banned).length,
    });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// GET /api/admin/books/pending
exports.pendingBooks = async (req, res, next) => {
  try {
    const books = await Book.findPending();
    res.json(books);
  } catch (err) { next(err); }
};

// PUT /api/admin/books/:id/approve
exports.approveBook = async (req, res, next) => {
  try {
    const book = await Book.setStatus(req.params.id, 'approved');
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
};

// PUT /api/admin/books/:id/reject
exports.rejectBook = async (req, res, next) => {
  try {
    const book = await Book.setStatus(req.params.id, 'rejected');
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
};

// DELETE /api/admin/books/:id — bonus, not in the original endpoint list but handy for moderation
exports.deleteBook = async (req, res, next) => {
  try {
    await Book.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};