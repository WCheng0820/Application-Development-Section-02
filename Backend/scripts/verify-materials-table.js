// Verify materials table structure
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'mlt_system'
        });

        const [columns] = await connection.query('SHOW COLUMNS FROM materials');
        
        console.log('\n=== Materials Table Structure ===');
        columns.forEach(col => {
            console.log(`${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key} ${col.Default || ''}`);
        });
        console.log('=================================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkTable();
