const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const addReportIdColumn = async () => {
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

        console.log('Adding reportId column to notification table...');
        // Check if column exists first to avoid error? Or just try ADD COLUMN
        try {
            await connection.query(`
                ALTER TABLE notification 
                ADD COLUMN reportId INT DEFAULT NULL
            `);
            console.log('✅ reportId column added successfully');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ reportId column already exists');
            } else {
                throw e;
            }
        }

    } catch (err) {
        console.error('❌ Error adding reportId column:', err);
    } finally {
        if (connection) await connection.end();
    }
};

addReportIdColumn();
