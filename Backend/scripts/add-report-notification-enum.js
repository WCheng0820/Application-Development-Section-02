const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const updateNotificationEnum = async () => {
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

        console.log('Updating notification type ENUM to include "report"...');
        await connection.query(`
            ALTER TABLE notification 
            MODIFY COLUMN type ENUM('message','booking','material','feedback','report') DEFAULT 'message'
        `);
        
        console.log('✅ Notification type ENUM updated successfully');

    } catch (err) {
        console.error('❌ Error updating notification ENUM:', err);
    } finally {
        if (connection) await connection.end();
    }
};

updateNotificationEnum();
