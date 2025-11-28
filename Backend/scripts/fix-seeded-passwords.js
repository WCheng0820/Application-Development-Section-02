// scripts/fix-seeded-passwords.js
const { query } = require('../config/database');
const crypto = require('crypto');

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

async function fix() {
    try {
        const hashed = hashPassword('seeded');
        const res = await query('UPDATE users SET password = ? WHERE password = ?', [hashed, 'seeded']);
        console.log('Updated rows:', res.affectedRows);
        process.exit(0);
    } catch (err) {
        console.error('Error updating seeded passwords:', err);
        process.exit(1);
    }
}

if (require.main === module) fix();

module.exports = fix;
