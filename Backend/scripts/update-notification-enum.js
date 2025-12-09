const { query } = require('../config/database');

const updateNotificationEnum = async () => {
    try {
        console.log('Updating notification type ENUM...');
        // Note: MODIFY COLUMN is used to change column definition
        await query(`
            ALTER TABLE notification 
            MODIFY COLUMN type ENUM('message','booking','material','feedback') DEFAULT 'message'
        `);
        console.log('✅ Notification type ENUM updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating notification ENUM:', err);
        process.exit(1);
    }
};

updateNotificationEnum();
