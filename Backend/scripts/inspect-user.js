const { query } = require('../config/database');

const email = process.argv[2] || 'ms._liu_hong@example.com';

(async () => {
  try {
    const rows = await query('SELECT id, username, email, password, role FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      console.log('No user found for email:', email);
      process.exit(0);
    }
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error querying user:', err);
    process.exit(1);
  }
})();
