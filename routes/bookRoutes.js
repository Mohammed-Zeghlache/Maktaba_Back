const router = require('express').Router();

const {
  list, getOne, create, update, remove, myBooks, getWishlist, toggleWishlist, uploadImages,
} = require('../controllers/bookController');

const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Specific/static paths must come before the generic '/:id' route
router.get('/my/books', auth, myBooks);
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist/:id', auth, toggleWishlist);
router.post('/upload', auth, upload.array('images', 5), uploadImages);

router.get('/', list);
router.get('/:id', optionalAuth, getOne);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;