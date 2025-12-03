// scripts/add-rating-count.js
// Adds rating_count column to tutor table if it does not exist
const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlt_system'
  };

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Connected to DB');

    const [rows] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tutor' AND COLUMN_NAME = 'rating_count'`,
      [config.database]
    );

    if (rows && rows.length > 0) {
      console.log('Column `rating_count` already exists on tutor table');
    } else {
      await conn.execute(`ALTER TABLE tutor ADD COLUMN rating_count INT DEFAULT 0`);
      console.log('Added `rating_count` column to tutor table');
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to add rating_count column:', err.message);
    process.exit(1);
  } finally {
    if (conn) try { await conn.end(); } catch(e){}
  }
})();
