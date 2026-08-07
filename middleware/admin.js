const { auth } = require('./auth');

// Requires a valid JWT AND role === 'admin'.
function adminOnly(req, res, next) {
  auth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = adminOnly;