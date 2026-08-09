// const router = require('express').Router();

// const {
//   list, getOne, create, update, remove, myBooks, getWishlist, toggleWishlist, uploadImages,
// } = require('../controllers/bookController');

// const { auth, optionalAuth } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// // Specific/static paths must come before the generic '/:id' route
// router.get('/my/books', auth, myBooks);
// router.get('/wishlist', auth, getWishlist);
// router.post('/wishlist/:id', auth, toggleWishlist);
// router.post('/upload', auth, upload.array('images', 5), uploadImages);

// router.get('/', list);
// router.get('/:id', optionalAuth, getOne);
// router.post('/', auth, create);
// router.put('/:id', auth, update);
// router.delete('/:id', auth, remove);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getMyBooks,
  getWishlist,
  toggleWishlist,
} = require('../controllers/bookController');

// Public routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes
router.post('/', auth, createBook);
router.put('/:id', auth, updateBook);
router.delete('/:id', auth, deleteBook);
router.get('/my/books', auth, getMyBooks);

// Wishlist routes
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist/:bookId', auth, toggleWishlist);

module.exports = router;
