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
    console.log('📋 Checking Reports table structure...');
    const [reportsColumns] = await connection.query('DESCRIBE reports');
    console.log('\n✅ Reports table columns:');
    reportsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n📋 Checking Notification table structure...');
    const [notifColumns] = await connection.query('DESCRIBE notification');
    console.log('\n✅ Notification table columns:');
    notifColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n📋 Checking if reportId column exists in notification table...');
    const reportIdExists = notifColumns.some(col => col.Field === 'reportId');
    if (reportIdExists) {
      console.log('✅ reportId column exists in notification table');
    } else {
      console.log('❌ reportId column NOT found in notification table');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
    process.exit(0);
  }
})();
