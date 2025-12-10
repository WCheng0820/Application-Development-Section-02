const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlt_system',
};

(async () => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Dropping notification table...');
    await connection.query('DROP TABLE IF EXISTS notification');
    console.log('✅ Notification table dropped');
    
    console.log('Recreating notification table with reportId column...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipientId VARCHAR(255) NOT NULL,
        senderId VARCHAR(255) NOT NULL,
        bookingId INT,
        messageId INT,
        reportId INT,
        text TEXT,
        type ENUM('message','booking','material','feedback','report') DEFAULT 'message',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bookingId) REFERENCES booking(bookingId) ON DELETE CASCADE,
        FOREIGN KEY (messageId) REFERENCES message(id) ON DELETE CASCADE,
        INDEX idx_recipientId (recipientId),
        INDEX idx_senderId (senderId),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Notification table recreated successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
    process.exit(0);
  }
})();
