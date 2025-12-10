const { query, pool } = require('../config/database');

async function fixNotifications() {
    try {
        console.log('Starting notification fix...');

        // 1. Get all unread notifications
        const notifications = await query(
            `SELECT n.id, n.recipientId, n.messageId, m.readBy_json 
             FROM notification n
             JOIN message m ON n.messageId = m.id
             WHERE n.is_read = FALSE`
        );

        console.log(`Found ${notifications.length} unread notifications.`);

        let fixedCount = 0;

        for (const n of notifications) {
            const readBy = n.readBy_json ? JSON.parse(n.readBy_json) : [];
            const isReadByRecipient = readBy.some(r => r.userId === n.recipientId);

            if (isReadByRecipient) {
                // Message is read, but notification is not. Fix it.
                await query(
                    `UPDATE notification SET is_read = TRUE WHERE id = ?`,
                    [n.id]
                );
                fixedCount++;
            }
        }

        console.log(`Fixed ${fixedCount} notifications that were actually read.`);

        // Optional: Delete notifications for messages that don't exist anymore
        const orphans = await query(
            `SELECT n.id FROM notification n
             LEFT JOIN message m ON n.messageId = m.id
             WHERE m.id IS NULL`
        );
        
        if (orphans.length > 0) {
            console.log(`Found ${orphans.length} orphan notifications. Deleting...`);
            const ids = orphans.map(o => o.id).join(',');
            await query(`DELETE FROM notification WHERE id IN (${ids})`);
        }

        console.log('✅ Notification fix complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing notifications:', err);
        process.exit(1);
    }
}

fixNotifications();
