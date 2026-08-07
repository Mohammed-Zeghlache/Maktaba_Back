const jwt = require('jsonwebtoken');

// Requires a valid JWT. Sets req.user = { id, role, email }.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attaches req.user if a valid token is present, but never blocks the request.
// Used on routes that behave differently for guests vs. logged-in users
// (e.g. GET /books/:id needs to know if the requester is the owner).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // ignore invalid/expired token on optional routes
    }
  }
  next();
}

module.exports = { auth, optionalAuth };