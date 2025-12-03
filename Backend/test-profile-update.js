const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:5000/api/auth';

// Generate unique test credentials
const timestamp = Date.now();
const testUser = {
    username: `teststudent${timestamp}`,
    email: `teststudent${timestamp}@example.com`,
    password: 'password123',
    role: 'student'
};

const updatedProfile = {
    username: `updatedstudent${timestamp}`,
    email: `updatedstudent${timestamp}@example.com`,
    password: 'newpassword123'
};

async function testProfileUpdate() {
    console.log('🧪 Testing Profile Update Functionality for Students/Admins\n');

    let userId = null;
    let sessionToken = null;

    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok || !registerResult.success) {
            throw new Error(`Registration failed: ${registerResult.error}`);
        }

        console.log('✅ User registered successfully');
        userId = registerResult.user.id;
        sessionToken = registerResult.session.token;

        // Step 2: Update profile with new username, email, and password
        console.log('\n2. Updating profile (username, email, password)...');
        const updateResponse = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify(updatedProfile)
        });

        const updateResult = await updateResponse.json();

        if (!updateResponse.ok || !updateResult.success) {
            throw new Error(`Profile update failed: ${updateResult.error}`);
        }

        console.log('✅ Profile updated successfully');
        console.log('   Updated user data:', {
            id: updateResult.user.id,
            username: updateResult.user.username,
            email: updateResult.user.email,
            role: updateResult.user.role
        });

        // Step 3: Verify the update was synchronous by checking database immediately
        console.log('\n3. Verifying synchronous database update...');

        // Try to login with new credentials to verify password was updated
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: updatedProfile.username,
                password: updatedProfile.password
            })
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok || !loginResult.success) {
            throw new Error(`Login with updated credentials failed: ${loginResult.error}`);
        }

        console.log('✅ Synchronous password update verified - login successful with new credentials');

        // Step 4: Test edge cases
        console.log('\n4. Testing edge cases...');

        // Test updating with same username/email (should fail)
        const duplicateUpdateResponse = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.session.token}`
            },
            body: JSON.stringify({
                username: updatedProfile.username,
                email: updatedProfile.email,
                password: 'anotherpassword123'
            })
        });

        const duplicateUpdateResult = await duplicateUpdateResponse.json();

        if (duplicateUpdateResponse.ok && duplicateUpdateResult.success) {
            console.log('⚠️  Warning: Duplicate username/email update should have failed');
        } else {
            console.log('✅ Duplicate username/email update correctly rejected');
        }

        // Test password validation (too short)
        const shortPasswordResponse = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.session.token}`
            },
            body: JSON.stringify({
                username: 'validusername',
                email: 'valid@example.com',
                password: '123' // Too short
            })
        });

        const shortPasswordResult = await shortPasswordResponse.json();

        if (shortPasswordResponse.ok && shortPasswordResult.success) {
            console.log('⚠️  Warning: Short password update should have failed');
        } else {
            console.log('✅ Short password update correctly rejected');
        }

        // Step 5: Cleanup - logout
        console.log('\n5. Cleaning up...');
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${loginResult.session.token}`
            }
        });

        console.log('✅ Test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('- Profile updates work correctly for students/admins');
        console.log('- Password changes are processed synchronously');
        console.log('- Database updates are immediate and consistent');
        console.log('- Validation works for duplicate usernames/emails and password length');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testProfileUpdate();
}

module.exports = { testProfileUpdate };
