const pool = require('../config/db');

function buildFilters(filters) {
  const clauses = [];
  const values = [];
  let i = 1;

  if (filters.status) { clauses.push(`status = $${i++}`); values.push(filters.status); }
  if (filters.major) { clauses.push(`major_key = $${i++}`); values.push(filters.major); }
  if (filters.university) { clauses.push(`university_key = $${i++}`); values.push(filters.university); }
  if (filters.year) { clauses.push(`year_key = $${i++}`); values.push(filters.year); }
  if (filters.exchange) { clauses.push(`exchange_key = $${i++}`); values.push(filters.exchange); }
  if (filters.semester) { clauses.push(`semester = $${i++}`); values.push(Number(filters.semester)); }
  if (filters.city) {
    clauses.push(`(city_ar ILIKE $${i} OR city_en ILIKE $${i})`);
    values.push(`%${filters.city}%`);
    i++;
  }
  if (filters.search) {
    clauses.push(`(title_ar ILIKE $${i} OR title_en ILIKE $${i})`);
    values.push(`%${filters.search}%`);
    i++;
  }
  if (filters.userId) { clauses.push(`user_id = $${i++}`); values.push(filters.userId); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values, next: i };
}

const SORTS = {
  newest: 'joined_date DESC',
  oldest: 'joined_date ASC',
  priceAsc: 'price ASC NULLS LAST',
  priceDesc: 'price DESC NULLS LAST',
  popular: 'views DESC',
};

const Book = {
  async findAll(filters = {}, page = 1, limit = 12) {
    const { where, values, next } = buildFilters(filters);
    const sort = SORTS[filters.sort] || SORTS.newest;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12));
    const offset = (safePage - 1) * safeLimit;

    const listSql = `SELECT * FROM books ${where} ORDER BY ${sort} LIMIT $${next} OFFSET $${next + 1}`;
    const countSql = `SELECT COUNT(*) FROM books ${where}`;

    const { rows } = await pool.query(listSql, [...values, safeLimit, offset]);
    const { rows: countRows } = await pool.query(countSql, values);

    return { books: rows, total: Number(countRows[0].count), page: safePage, limit: safeLimit };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return rows[0];
  },

  async create(data) {
    const {
      userId, titleAr, titleEn, descAr, descEn, authorAr, authorEn, ownerAr, ownerEn,
      cityAr, cityEn, universityKey, majorKey, yearKey, semester, conditionKey,
      exchangeKey, price, phone, images, status = 'pending',
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO books (
         user_id, title_ar, title_en, desc_ar, desc_en, author_ar, author_en, owner_ar, owner_en,
         city_ar, city_en, university_key, major_key, year_key, semester, condition_key,
         exchange_key, price, phone, images, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING *`,
      [
        userId, titleAr || null, titleEn || null, descAr || null, descEn || null,
        authorAr || null, authorEn || null, ownerAr || null, ownerEn || null,
        cityAr || null, cityEn || null, universityKey, majorKey, yearKey, semester,
        conditionKey, exchangeKey, price, phone, JSON.stringify(images || []), status,
      ]
    );
    return rows[0];
  },

  async update(id, data) {
    const map = {
      titleAr: 'title_ar', titleEn: 'title_en', descAr: 'desc_ar', descEn: 'desc_en',
      authorAr: 'author_ar', authorEn: 'author_en', ownerAr: 'owner_ar', ownerEn: 'owner_en',
      cityAr: 'city_ar', cityEn: 'city_en', universityKey: 'university_key', majorKey: 'major_key',
      yearKey: 'year_key', semester: 'semester', conditionKey: 'condition_key',
      exchangeKey: 'exchange_key', price: 'price', phone: 'phone', status: 'status',
    };

    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(data[key]);
      }
    }
    if (data.images !== undefined) {
      fields.push(`images = $${i++}`);
      values.push(JSON.stringify(data.images));
    }
    if (!fields.length) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE books SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
  },

  async incrementViews(id) {
    await pool.query('UPDATE books SET views = views + 1 WHERE id = $1', [id]);
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM books WHERE user_id = $1 ORDER BY joined_date DESC',
      [userId]
    );
    return rows;
  },

  async findPending() {
    const { rows } = await pool.query(`
      SELECT b.*, u.first_name, u.last_name
      FROM books b
      JOIN users u ON u.id = b.user_id
      WHERE b.status = 'pending'
      ORDER BY b.joined_date ASC
    `);
    return rows;
  },

  async setStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE books SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },

  async stats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
        COALESCE(SUM(views), 0) AS total_views
      FROM books
    `);
    return rows[0];
  },
};

module.exports = Book;