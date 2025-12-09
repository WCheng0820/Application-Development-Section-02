const { query } = require('../config/database');

const addAnonymousColumn = async () => {
    try {
        console.log('Adding is_anonymous column to feedback table...');
        
        // Check if column exists first
        const columns = await query(`SHOW COLUMNS FROM feedback LIKE 'is_anonymous'`);
        
        if (columns.length === 0) {
            await query(`
                ALTER TABLE feedback
                ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ is_anonymous column added successfully');
        } else {
            console.log('ℹ️ is_anonymous column already exists');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding column:', err);
        process.exit(1);
    }
};

addAnonymousColumn();
