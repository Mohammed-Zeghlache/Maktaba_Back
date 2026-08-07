function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  // Common Postgres error codes worth translating into friendlier messages
  if (err.code === '23505') {
    return res.status(409).json({ error: 'This record already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Related record not found' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { notFound, errorHandler };