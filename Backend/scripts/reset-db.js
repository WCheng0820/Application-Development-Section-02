// scripts/reset-db.js
// Script to drop and recreate all tables with new schema
const mysql = require('mysql2/promise');

const resetDatabase = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mlt_system',
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database\n');

        console.log('⚠️  WARNING: This will delete all existing data!');
        console.log('Dropping existing tables...\n');

        // Drop tables in correct order (respecting foreign keys)
        const tables = ['sessions', 'student', 'tutor', 'admin', 'users'];
        
        for (const table of tables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`   ✓ Dropped table: ${table}`);
            } catch (error) {
                console.log(`   ⚠ Could not drop ${table}: ${error.message}`);
            }
        }

        console.log('\n✅ All tables dropped');
        console.log('Now run: npm run init-db\n');

    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database does not exist. Run: npm run init-db');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

resetDatabase();

