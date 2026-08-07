// const { Pool } = require('pg');
// require('dotenv').config();

// // Supports either a single DATABASE_URL, or discrete DB_* fields.
// const useConnectionString = !!process.env.DATABASE_URL;

// const pool = new Pool(
//   useConnectionString
//     ? {
//         connectionString: process.env.DATABASE_URL,
//         ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
//       }
//     : {
//         host: process.env.DB_HOST || 'localhost',
//         port: Number(process.env.DB_PORT) || 5432,
//         user: process.env.DB_USER || 'postgres',
//         password: process.env.DB_PASSWORD || 'postgres',
//         database: process.env.DB_NAME || 'maktabi',
//         ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
//       }
// );

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle PostgreSQL client', err);
//   process.exit(-1);
// });

// module.exports = pool;

const { Pool } = require('pg');
require('dotenv').config();

// Supports either a single DATABASE_URL, or discrete DB_* fields.
const useConnectionString = !!process.env.DATABASE_URL;

const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'maktabi',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Function to test database connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully!');
    console.log(`📅 Server time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Auto-test connection when module loads
testConnection();

module.exports = pool;