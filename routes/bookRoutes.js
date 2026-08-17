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

// WISHLIST ROUTES (must come before /:id)

router.get('/wishlist', auth, getWishlist);
router.post('/wishlist/:id', auth, toggleWishlist);

// OTHER SPECIFIC ROUTES

router.get('/my/books', auth, myBooks);
router.post('/upload', auth, upload.array('images', 5), uploadImages);

// PUBLIC ROUTES

router.get('/', list);
router.get('/:id', getOne);

// PROTECTED ROUTES

router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
