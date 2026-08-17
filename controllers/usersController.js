const User = require('../models/User');

exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/ban
// Body: { banned: true|false } — if omitted, toggles the current state.
exports.ban = async (req, res, next) => {
  try {
    const current = await User.findById(req.params.id);
    if (!current) return res.status(404).json({ error: 'User not found' });

    const { banned } = req.body;
    const nextState = typeof banned === 'boolean' ? banned : !current.is_banned;
    const updated = await User.setBanned(req.params.id, nextState);
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};
