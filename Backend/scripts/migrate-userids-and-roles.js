// scripts/migrate-userids-and-roles.js
// Backfill users.userId and create missing tutor/student rows for users with those roles
const { query } = require('../config/database');

const migrate = async () => {
  try {
    // Find users without userId
    const users = await query('SELECT id, role FROM users WHERE userId IS NULL OR userId = ""');
    console.log('Found users to backfill:', users.length);

    for (const u of users) {
      const pref = u.role === 'admin' ? 'a' : (u.role === 'tutor' ? 't' : 's');
      const userIdStr = `${pref}${String(u.id).padStart(6, '0')}`;
      await query('UPDATE users SET userId = ? WHERE id = ?', [userIdStr, u.id]);
      console.log(`Backfilled user ${u.id} -> ${userIdStr}`);
    }

    // For tutors: create tutor row if missing
    const tutorsMissing = await query(`
      SELECT u.id FROM users u
      LEFT JOIN tutor t ON t.user_id = u.id
      WHERE u.role = 'tutor' AND t.user_id IS NULL
    `);
    console.log('Tutors missing role row:', tutorsMissing.length);
    for (const r of tutorsMissing) {
      const roleId = `t${String(r.id).padStart(6,'0')}`;
      await query(
        `INSERT INTO tutor (tutorId, user_id, name, verification_documents) VALUES (?, ?, ?, ?)`,
        [roleId, r.id, `Tutor ${r.id}`, JSON.stringify([])]
      );
      console.log(`Inserted tutor row for user ${r.id}`);
    }

    // For students: create student row if missing
    const studentsMissing = await query(`
      SELECT u.id FROM users u
      LEFT JOIN student s ON s.user_id = u.id
      WHERE u.role = 'student' AND s.user_id IS NULL
    `);
    console.log('Students missing role row:', studentsMissing.length);
    for (const r of studentsMissing) {
      const roleId = `s${String(r.id).padStart(6,'0')}`;
      await query(
        `INSERT INTO student (studentId, user_id, yearOfStudy) VALUES (?, ?, ?)`,
        [roleId, r.id, 1]
      );
      console.log(`Inserted student row for user ${r.id}`);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
};

if (require.main === module) migrate();

module.exports = migrate;
