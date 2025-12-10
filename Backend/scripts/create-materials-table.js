// Create materials table in mlt_system database
const { query } = require('../config/database');

async function createMaterialsTable() {
  try {
    console.log('Creating materials table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        drive_file_id VARCHAR(255) NOT NULL,
        web_view_link TEXT,
        web_content_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Materials table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating materials table:', error);
    process.exit(1);
  }
}

createMaterialsTable();
