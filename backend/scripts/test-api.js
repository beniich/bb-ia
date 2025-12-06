const axios = require('axios');
const API_URL = 'http://localhost:4001/api';

async function runTests() {
    console.log('🚀 Starting API Verification Tests...\n');

    let token;
    let userId;
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'password123';

    // 1. Test Signup
    try {
        console.log(`1️⃣  Testing Signup (${testEmail})...`);
        const res = await axios.post(`${API_URL}/auth/signup`, {
            email: testEmail,
            password: testPassword
        });
        if (res.data.access && res.data.user) {
            console.log('✅ Signup Successful');
            token = res.data.access;
            userId = res.data.user.id;
        } else {
            console.error('❌ Signup Failed: No token returned', res.data);
        }
    } catch (e) {
        console.error('❌ Signup Error:', e.response?.data || e.message);
    }

    // 2. Test Signin
    try {
        console.log(`\n2️⃣  Testing Signin...`);
        const res = await axios.post(`${API_URL}/auth/signin`, {
            email: testEmail,
            password: testPassword
        });
        if (res.data.access) {
            console.log('✅ Signin Successful');
            token = res.data.access; // Refresh token
        } else {
            console.error('❌ Signin Failed', res.data);
        }
    } catch (e) {
        console.error('❌ Signin Error:', e.response?.data || e.message);
    }

    if (!token) {
        console.log('\n🛑 Aborting remaining tests due to Authentication failure.');
        return;
    }

    // 3. Test Protected Route (/me)
    try {
        console.log(`\n3️⃣  Testing Protected Route (/auth/me)...`);
        const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user.email === testEmail) {
            console.log('✅ Protected Route Accessed');
        } else {
            console.error('❌ Data Mismatch', res.data);
        }
    } catch (e) {
        console.error('❌ Protected Route Error:', e.response?.data || e.message);
    }

    // 4. Test Subscription (Create Checkout)
    try {
        console.log(`\n4️⃣  Testing Subscription Checkout...`);
        const res = await axios.post(`${API_URL}/subscription/create-checkout-session`, {
            priceId: 'price_test_123'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.url) {
            console.log('✅ Checkout Session Created');
        } else {
            console.error('❌ Checkout Failed', res.data);
        }
    } catch (e) {
        console.error('❌ Subscription Error:', e.response?.data || e.message);
    }

    // 5. Test Admin Access (Should Fail for basic user)
    try {
        console.log(`\n5️⃣  Testing Admin Access (Basic User)...`);
        await axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.error('❌ Admin Access Should Have Failed but Succeeded');
    } catch (e) {
        if (e.response?.status === 403) {
            console.log('✅ Admin Access Correctly Denied (403)');
        } else {
            console.error('❌ Unexpected Admin Error:', e.response?.data || e.message);
        }
    }

    console.log('\n🏁 Tests Completed.');
}

runTests();
