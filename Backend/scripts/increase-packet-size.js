const mysql = require('mysql2/promise');

async function increasePacketSize() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    };

    console.log('Connecting to MySQL...');
    let connection = await mysql.createConnection(config);

    try {
        console.log('Checking current max_allowed_packet...');
        const [rows] = await connection.query("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('Current value:', rows[0].Value);

        console.log('Attempting to set max_allowed_packet to 64MB (67108864 bytes)...');
        await connection.query("SET GLOBAL max_allowed_packet = 67108864");
        console.log('Command executed.');

        await connection.end();

        console.log('Reconnecting to verify...');
        connection = await mysql.createConnection(config);
        const [newRows] = await connection.query("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('New value:', newRows[0].Value);

        if (parseInt(newRows[0].Value) >= 67108864) {
            console.log('✅ SUCCESS: max_allowed_packet increased.');
        } else {
            console.log('❌ FAILURE: max_allowed_packet did not change. You may need to edit my.ini/my.cnf manually.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

increasePacketSize();
