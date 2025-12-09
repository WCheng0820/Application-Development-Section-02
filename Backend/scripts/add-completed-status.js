// scripts/add-completed-status.js
// Adds 'completed' value to booking.status ENUM if not present
const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlt_system',
    multipleStatements: true
  };

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Connected to DB for migration');

    // Inspect current enum values
    const [rows] = await conn.execute(`
      SELECT COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'booking' AND COLUMN_NAME = 'status'
    `, [config.database]);

    if (!rows || rows.length === 0) {
      console.error('booking.status column not found. Make sure the database and table exist.');
      process.exit(1);
    }

    const columnType = rows[0].COLUMN_TYPE; // e.g. "enum('confirmed','pending','cancelled')"
    console.log('Current booking.status column type:', columnType);

    if (columnType.includes("'completed'")) {
      console.log("'completed' is already present in booking.status enum. No changes needed.");
      process.exit(0);
    }

    // Build new enum definition by appending completed
    // Extract existing values inside enum(...)
    const enumValues = columnType.match(/^enum\((.*)\)$/i);
    if (!enumValues || !enumValues[1]) {
      throw new Error('Could not parse enum values from COLUMN_TYPE: ' + columnType);
    }

    const existingList = enumValues[1];
    const newList = existingList + ",'completed'";

    // Perform ALTER TABLE to modify column type
    const alterSql = `ALTER TABLE booking MODIFY COLUMN status ENUM(${newList}) NOT NULL DEFAULT 'pending'`;
    console.log('Running:', alterSql);
    await conn.execute(alterSql);

    console.log("Migration complete: 'completed' added to booking.status enum.");
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
