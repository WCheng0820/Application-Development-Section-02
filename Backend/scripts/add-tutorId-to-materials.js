const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTutorIdColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mlt_system'
    });

    try {
        // Check if tutorId column exists
        const [columns] = await connection.query(
            `SHOW COLUMNS FROM materials LIKE 'tutorId'`
        );

        if (columns.length === 0) {
            console.log('Adding tutorId column to materials table...');
            await connection.query(`
                ALTER TABLE materials 
                ADD COLUMN tutorId VARCHAR(20) AFTER web_content_link,
                ADD INDEX idx_tutorId (tutorId)
            `);
            console.log('✅ tutorId column added successfully');
        } else {
            console.log('✅ tutorId column already exists');
        }
    } catch (error) {
        console.error('❌ Error adding tutorId column:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

addTutorIdColumn()
    .then(() => {
        console.log('Migration completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
