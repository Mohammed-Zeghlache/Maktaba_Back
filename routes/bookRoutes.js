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

// const router = require('express').Router();

// const {
//   list, getOne, create, update, remove, myBooks, getWishlist, toggleWishlist, uploadImages,
// } = require('../controllers/bookController');

// const { auth } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// // ========================================================
// // SPECIFIC ROUTES (must come before /:id)
// // ========================================================
// router.get('/my/books', auth, myBooks);
// router.get('/wishlist', auth, getWishlist);
// router.post('/wishlist/:id', auth, toggleWishlist);
// router.post('/upload', auth, upload.array('images', 5), uploadImages);

// // ========================================================
// // PUBLIC ROUTES
// // ========================================================
// router.get('/', list);
// router.get('/:id', getOne); // Remove optionalAuth - use null or just the handler

// // ========================================================
// // PROTECTED ROUTES
// // ========================================================
// router.post('/', auth, create);
// router.put('/:id', auth, update);
// router.delete('/:id', auth, remove);

// module.exports = router;





// ✅ Only ONE declaration at the top
const router = require('express').Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
  myBooks,
  getWishlist,
  toggleWishlist,
  uploadImages,
} = require('../controllers/bookController');

const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Debug - check all functions are loaded
console.log('📚 Book routes loaded:');
console.log('  - list:', typeof list);
console.log('  - getOne:', typeof getOne);
console.log('  - create:', typeof create);
console.log('  - update:', typeof update);
console.log('  - remove:', typeof remove);
console.log('  - myBooks:', typeof myBooks);
console.log('  - getWishlist:', typeof getWishlist);
console.log('  - toggleWishlist:', typeof toggleWishlist);
console.log('  - uploadImages:', typeof uploadImages);

// ========================================================
// WISHLIST ROUTES (must come before /:id)
// ========================================================
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist/:id', auth, toggleWishlist);

// ========================================================
// OTHER SPECIFIC ROUTES
// ========================================================
router.get('/my/books', auth, myBooks);
router.post('/upload', auth, upload.array('images', 5), uploadImages);

// ========================================================
// PUBLIC ROUTES
// ========================================================
router.get('/', list);
router.get('/:id', getOne);

// ========================================================
// PROTECTED ROUTES
// ========================================================
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

// ✅ Only ONE export at the bottom
module.exports = router;
