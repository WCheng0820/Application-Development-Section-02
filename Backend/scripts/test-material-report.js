// Backend/scripts/test-material-report.js
// Test script to verify material report insertion into existing reports table

const db = require('../config/database');

async function testMaterialReport() {
    try {
        console.log('Testing material report insertion...');
        
        // Check if materials table has data
        const [materials] = await db.query('SELECT * FROM materials LIMIT 1');
        if (!materials.length) {
            console.log('No materials in database. Please upload a material first.');
            return;
        }
        
        const testMaterial = materials[0];
        console.log(`Using test material: ${testMaterial.title} (ID: ${testMaterial.id})`);
        
        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE role = "student" LIMIT 1');
        if (!users.length) {
            console.log('No student user found. Please create a student account first.');
            return;
        }
        
        const testUser = users[0];
        console.log(`Using test student: ${testUser.username} (ID: ${testUser.userId})`);
        
        // Insert test report
        const [result] = await db.query(
            `INSERT INTO reports (reporter_id, reported_id, target_type, target_id, category, description, evidence_url, status)
             VALUES (?, NULL, 'content', ?, 'material', ?, ?, 'pending')`,
            [testUser.userId, testMaterial.id, 'Test report reason', testMaterial.web_view_link]
        );
        
        console.log(`Report created with ID: ${result.insertId}`);
        
        // Verify it was inserted
        const [inserted] = await db.query(
            'SELECT * FROM reports WHERE id = ? AND target_type = "content" AND category = "material"',
            [result.insertId]
        );
        
        if (inserted.length > 0) {
            console.log('✓ Report successfully inserted and verified');
            console.log('Report details:', inserted[0]);
        } else {
            console.log('✗ Report inserted but verification query returned no results');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testMaterialReport();
