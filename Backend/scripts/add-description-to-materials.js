// Script to add description column to existing materials table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDescriptionColumn() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'mlt_system'
        });

        console.log('Connected to database');

        // Check if description column already exists
        const [columns] = await connection.query(
            `SHOW COLUMNS FROM materials LIKE 'description'`
        );

        if (columns.length > 0) {
            console.log('✅ Description column already exists');
            return;
        }

        // Add description column after title
        await connection.query(`
            ALTER TABLE materials 
            ADD COLUMN description TEXT AFTER title
        `);

        console.log('✅ Description column added successfully');

        // Verify the column was added
        const [result] = await connection.query(
            `SHOW COLUMNS FROM materials`
        );
        
        console.log('\nCurrent materials table structure:');
        result.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addDescriptionColumn();
