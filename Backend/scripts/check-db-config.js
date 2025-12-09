const { query, pool } = require('../config/database');

async function checkConfig() {
    try {
        const result = await query("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('Current max_allowed_packet:', result);
        
        // Try to set it to 64MB
        try {
            await query("SET GLOBAL max_allowed_packet = 67108864");
            console.log('Attempted to set max_allowed_packet to 64MB');
            
            const newResult = await query("SHOW VARIABLES LIKE 'max_allowed_packet'");
            console.log('New max_allowed_packet:', newResult);
        } catch (err) {
            console.error('Failed to set global variable (might need root/super privileges):', err.message);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkConfig();
