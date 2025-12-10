const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const updateReportsTable = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mlt_system'
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server');

        console.log('Modifying evidence_url column to LONGTEXT...');
        await connection.query(`
            ALTER TABLE reports 
            MODIFY COLUMN evidence_url LONGTEXT
        `);
        
        console.log('✅ evidence_url column updated to LONGTEXT successfully');

    } catch (err) {
        console.error('❌ Error updating table:', err);
    } finally {
        if (connection) await connection.end();
    }
};

updateReportsTable();
