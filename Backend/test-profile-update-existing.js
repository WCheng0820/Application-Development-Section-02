const fetch = require('node-fetch').default;

async function testProfileUpdate() {
    console.log('🧪 Testing Profile Update with Existing Admin User');

    try {
        // First login with admin
        console.log('\n1. Logging in as admin...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@mltsystem.com',
                password: 'admin123'
            })
        });

        const loginResult = await loginResponse.json();
        console.log('Login response:', loginResult);

        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }

        const token = loginResult.session.token;
        console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

        // Now try to update profile
        console.log('\n2. Updating profile...');
        const updateResponse = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username: 'admin',
                email: 'admin@mltsystem.com',
                bio: 'Updated admin bio'
            })
        });

        const updateResult = await updateResponse.json();
        console.log('Update response status:', updateResponse.status);
        console.log('Update response:', updateResult);

        if (updateResult.success) {
            console.log('✅ Profile update successful!');
        } else {
            console.log('❌ Profile update failed:', updateResult.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testProfileUpdate();
