const { pool } = require('../config/database');

async function addIsAnonymousColumn() {
    const conn = await pool.getConnection();
    try {
        // Check if column already exists
        const [columns] = await conn.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'is_anonymous' AND TABLE_SCHEMA = DATABASE()"
        );

        if (columns.length > 0) {
            console.log('✅ Column "is_anonymous" already exists in feedback table');
            conn.release();
            process.exit(0);
        }

        // Add the column
        await conn.query(
            'ALTER TABLE feedback ADD COLUMN is_anonymous TINYINT DEFAULT 0'
        );
        console.log('✅ Column "is_anonymous" added to feedback table');
        conn.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding is_anonymous column:', error.message);
        conn.release();
        process.exit(1);
    }
}

addIsAnonymousColumn();
