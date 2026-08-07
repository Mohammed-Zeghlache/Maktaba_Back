const router = require('express').Router();
const adminOnly = require('../middleware/admin');
const { getUsers } = require("../controllers/adminController");
const {
  stats, pendingBooks, approveBook, rejectBook, deleteBook,
} = require('../controllers/adminController');

router.get('/stats', adminOnly, stats);
router.get('/books/pending', adminOnly, pendingBooks);
router.put('/books/:id/approve', adminOnly, approveBook);
router.put('/books/:id/reject', adminOnly, rejectBook);
router.delete('/books/:id', adminOnly, deleteBook);
router.get("/users", adminOnly, getUsers);

module.exports = router;