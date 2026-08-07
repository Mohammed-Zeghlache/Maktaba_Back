const router = require('express').Router();
const adminOnly = require('../middleware/admin');
const { list, ban, remove } = require('../controllers/usersController');

router.get('/', adminOnly, list);
router.put('/:id/ban', adminOnly, ban);
router.delete('/:id', adminOnly, remove);

module.exports = router;