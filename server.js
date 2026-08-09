require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const pool = require('./config/db'); 

const app = express();


app.use(cors({
  origin: 'https://maktabat-etalib.netlify.app'
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post('/test-login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.json({ error: 'Admin not found' });
    }
    
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    
    res.json({
      email: admin.email,
      password_hash: admin.password_hash,
      match: match,
      password_entered: password
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
