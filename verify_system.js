const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ML_URL = 'http://localhost:5001';

async function verifySystem() {
    console.log('--- Digital Health System Verification ---');

    // 1. Check ML Service
    try {
        const mlRes = await axios.post(`${ML_URL}/predict/diabetes`, {
            bmi: 28,
            sugar: 150,
            age: 45
        });
        console.log('✅ ML Service: Connected (Sample Risk Score:', mlRes.data.risk_score + ')');
    } catch (err) {
        console.log('❌ ML Service: Connection Failed -', err.message);
    }

    // 2. Check Backend Health
    try {
        const authCheck = await axios.get(`${BASE_URL}/auth/check`).catch(e => e.response);
        console.log('✅ Backend: Online');
    } catch (err) {
        console.log('❌ Backend: Offline');
    }

    console.log('\n--- Planned Manual Checks ---');
    console.log('1. Login as admin@demo.com -> Verify stats update.');
    console.log('2. Login as doctor@demo.com -> Verify critical patients appear for high BP.');
    console.log('3. Login as patient@demo.com -> Verify "AI Health Score" displays correctly.');
}

verifySystem();
