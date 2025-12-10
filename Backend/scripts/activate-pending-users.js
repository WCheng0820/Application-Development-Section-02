// scripts/activate-pending-users.js
// Activate pending users by creating their role-specific records if not already present
const { query } = require('../config/database');

const activatePendingUsers = async () => {
  try {
    // Find users with status 'pending' and populate their role records
    const pendingUsers = await query(`
      SELECT id, userId, username, role FROM users WHERE status = 'pending'
    `);

    console.log(`Found ${pendingUsers.length} pending users to activate`);

    for (const user of pendingUsers) {
      // Check if role record already exists
      let roleExists = false;

      if (user.role === 'tutor') {
        const tutors = await query('SELECT tutor_pk FROM tutor WHERE user_id = ?', [user.id]);
        roleExists = tutors.length > 0;
      } else if (user.role === 'student') {
        const students = await query('SELECT student_pk FROM student WHERE user_id = ?', [user.id]);
        roleExists = students.length > 0;
      } else if (user.role === 'admin') {
        const admins = await query('SELECT adminId FROM admin WHERE user_id = ?', [user.id]);
        roleExists = admins.length > 0;
      }

      if (!roleExists) {
        // Create the role record
        const roleId = user.userId;

        if (user.role === 'tutor') {
          await query(
            `INSERT INTO tutor (tutorId, user_id, name, verification_documents) VALUES (?, ?, ?, ?)`,
            [roleId, user.id, user.username, JSON.stringify([])]
          );
          console.log(`✅ Created tutor record for user ${roleId}`);
        } else if (user.role === 'student') {
          await query(
            `INSERT INTO student (studentId, user_id, yearOfStudy) VALUES (?, ?, ?)`,
            [roleId, user.id, 1]
          );
          console.log(`✅ Created student record for user ${roleId}`);
        } else if (user.role === 'admin') {
          await query(
            `INSERT INTO admin (adminId, user_id, name) VALUES (?, ?, ?)`,
            [roleId, user.id, user.username]
          );
          console.log(`✅ Created admin record for user ${roleId}`);
        }
      } else {
        console.log(`ℹ️  Role record already exists for user ${user.userId}`);
      }
    }

    console.log('✅ Activation complete');
    process.exit(0);
  } catch (err) {
    console.error('Activation failed:', err);
    process.exit(1);
  }
};

if (require.main === module) activatePendingUsers();

module.exports = activatePendingUsers;
