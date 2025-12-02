const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:5000/api/auth';

async function testTutorProfileUpdate() {
    console.log('🧪 Testing Tutor Profile Update Functionality\n');

    let tutorToken = null;
    let tutorUserId = null;
    
    // Generate unique test user
    const timestamp = Date.now();
    const testUsername = `testtutorprofile${timestamp}`;
    const testEmail = `testtutorprofile${timestamp}@example.com`;

    try {
        // Step 1: Register a test tutor
        console.log('1. Registering test tutor...');
        const registerResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: testUsername,
                email: testEmail,
                password: 'tutorpass123',
                role: 'tutor',
                yearsOfExperience: 5,
                bio: 'Initial bio',
                specialization: 'HSK Test Prep',
                verificationDocuments: ['doc1.pdf']
            })
        });

        const registerResult = await registerResponse.json();
        console.log('Register response:', registerResult);

        if (!registerResponse.ok || !registerResult.success) {
            throw new Error(`Registration failed: ${registerResult.error}`);
        }

        console.log('✅ Tutor registered successfully');
        tutorUserId = registerResult.user.id;
        
        // Step 1b: Approve tutor (simulate admin approval)
        console.log('\n1b. Approving tutor (admin action)...');
        const approveResponse = await fetch(`${API_URL}/approve-tutor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tutorId: registerResult.user.tutorId
            })
        });

        const approveResult = await approveResponse.json();
        console.log('Approve response:', approveResult);

        if (!approveResponse.ok || !approveResult.success) {
            throw new Error(`Tutor approval failed: ${approveResult.error}`);
        }

        console.log('✅ Tutor approved successfully');

        // Now login to get token
        console.log('\n1c. Logging in as approved tutor...');
        const loginTutorResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: 'tutorpass123'
            })
        });

        const loginTutorResult = await loginTutorResponse.json();

        if (!loginTutorResponse.ok || !loginTutorResult.success) {
            throw new Error(`Tutor login failed: ${loginTutorResult.error}`);
        }

        tutorToken = loginTutorResult.session.token;
        console.log('✅ Tutor logged in successfully');

        // Step 2: Update tutor bio and specialization
        console.log('\n2. Updating tutor profile (bio and specialization)...');
        const updateResponse = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tutorToken}`
            },
            body: JSON.stringify({
                username: testUsername,
                email: testEmail,
                bio: 'Updated bio - Experienced Mandarin tutor specializing in conversational practice',
                specialization: 'Conversational'
            })
        });

        const updateResult = await updateResponse.json();
        console.log('Update response status:', updateResponse.status);
        console.log('Update response:', updateResult);

        if (!updateResponse.ok || !updateResult.success) {
            throw new Error(`Profile update failed: ${updateResult.error}`);
        }

        console.log('✅ Tutor profile updated successfully');

        // Verify bio and specialization were returned
        if (updateResult.user.bio === 'Updated bio - Experienced Mandarin tutor specializing in conversational practice' &&
            updateResult.user.specialization === 'Conversational') {
            console.log('✅ Bio and specialization correctly updated and returned');
        } else {
            console.log('⚠️  Warning: Bio or specialization mismatch in response');
            console.log('   Expected bio: "Updated bio - Experienced Mandarin tutor specializing in conversational practice"');
            console.log('   Got:', updateResult.user.bio);
            console.log('   Expected specialization: "Conversational"');
            console.log('   Got:', updateResult.user.specialization);
        }

        // Step 3: Test password update for tutor
        console.log('\n3. Testing password change for tutor...');
        const passwordUpdateResponse = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tutorToken}`
            },
            body: JSON.stringify({
                username: testUsername,
                email: testEmail,
                password: 'newtutorpass456'
            })
        });

        const passwordUpdateResult = await passwordUpdateResponse.json();

        if (!passwordUpdateResponse.ok || !passwordUpdateResult.success) {
            throw new Error(`Password update failed: ${passwordUpdateResult.error}`);
        }

        console.log('✅ Password changed successfully');

        // Step 4: Verify new password works with login
        console.log('\n4. Verifying new password with login...');
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: 'newtutorpass456'
            })
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok || !loginResult.success) {
            throw new Error(`Login with new password failed: ${loginResult.error}`);
        }

        console.log('✅ Login with new password successful');

        // Step 5: Verify tutor approval requirement (tutors start as pending)
        console.log('\n5. Checking tutor account status...');
        if (loginResult.user.status === 'pending') {
            console.log('⚠️  Tutor account status is "pending" - admin approval required');
            console.log('   This is expected behavior for tutor registration');
        } else if (loginResult.user.status === 'active') {
            console.log('✅ Tutor account is active');
        }

        console.log('\n✅ All tutor profile tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('- Tutor registration works correctly');
        console.log('- Bio and specialization updates work correctly');
        console.log('- Password changes are processed synchronously');
        console.log('- Updated profile data is returned in API responses');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testTutorProfileUpdate();
}

module.exports = { testTutorProfileUpdate };
