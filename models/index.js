const pool = require('../config/db');

// balak ndirha fi sql query w nruniha //
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(30) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      university_key VARCHAR(50) DEFAULT '',
      major_key VARCHAR(50) DEFAULT '',
      is_banned BOOLEAN DEFAULT false,
      joined_date TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      joined_date TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title_ar VARCHAR(255), title_en VARCHAR(255),
      desc_ar TEXT, desc_en TEXT,
      author_ar VARCHAR(255), author_en VARCHAR(255),
      owner_ar VARCHAR(255), owner_en VARCHAR(255),
      city_ar VARCHAR(120), city_en VARCHAR(120),
      university_key VARCHAR(50), major_key VARCHAR(50),
      year_key VARCHAR(10), semester INTEGER,
      condition_key VARCHAR(30), exchange_key VARCHAR(30),
      price NUMERIC(10,2),
      phone VARCHAR(30),
      images JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending',
      views INTEGER DEFAULT 0,
      joined_date TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      joined_date TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, book_id)
    );
  `);

  // Helpful indexes for the filters the frontend uses on /books
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_books_major ON books(major_key);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_books_university ON books(university_key);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);`);

  console.log('✅ Database tables ready');
}

module.exports = { initDb, pool };
