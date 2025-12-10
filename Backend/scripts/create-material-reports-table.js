// Create material_reports table
const { query } = require('../config/database');

async function createMaterialReportsTable() {
  try {
    console.log('Creating material_reports table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS material_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_id INT NOT NULL,
        student_id VARCHAR(255) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('open', 'reviewed', 'resolved', 'dismissed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
        INDEX idx_material_id (material_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Material reports table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating material_reports table:', error);
    process.exit(1);
  }
}

createMaterialReportsTable();
