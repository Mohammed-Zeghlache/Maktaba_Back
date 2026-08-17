const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, universityKey, majorKey } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findByEmailOrPhone(email, phone);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email or phone already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName, lastName, email, phone, passwordHash, universityKey, majorKey,
    });
    res.status(201).json({ user });
  } catch (err) { next(err); }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await Admin.findByEmail(email);
    if (admin) {
      const ok = await bcrypt.compare(password, admin.password_hash);
      if (ok) {
        const token = sign({ id: admin.id, role: 'admin', email: admin.email });
        const { password_hash: _pw, ...safeAdmin } = admin;
        return res.json({ token, user: { ...safeAdmin, role: 'admin' } });
      }
    }

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Incorrect email or password' });
    if (user.is_banned) {
      return res.status(403).json({ error: 'This account has been banned by an administrator' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password' });

    const token = sign({ id: user.id, role: 'user', email: user.email });
    const { password_hash: _pw, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, role: 'user' } });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      return res.json({ ...admin, role: 'admin' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, role: 'user' });
  } catch (err) { next(err); }
};
