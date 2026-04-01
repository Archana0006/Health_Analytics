const axios = require('axios');

async function verifyMLIntegration() {
    console.log('--- ML Multi-Model Integration Verification ---');

    // 1. Login to get token
    let token = '';
    let patientId = '';
    try {
        const authRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'patient@demo.com',
            password: 'password'
        });
        token = authRes.data.token;
        patientId = authRes.data.user.id;
        console.log('✅ Auth: Logged in as patient');
    } catch (err) {
        console.log('❌ Auth: Login failed. Make sure server is running and seeded.', err.message);
        return;
    }

    // 2. Baseline Check: Get patient records
    try {
        const recordsRes = await axios.get(`http://localhost:5000/api/records/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Baseline: Retrieved ${recordsRes.data.length} records`);
    } catch (err) {
        console.log('❌ Baseline Check Failed:', err.message);
    }

    // 3. Check Aggregate ML Score
    try {
        const mlRes = await axios.get(`http://localhost:5000/api/records/ml-score/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n--- Aggregate Health Assessment Results ---');
        console.log('Score:', mlRes.data.score);
        console.log('Recommendation:', mlRes.data.recommendation);
        console.log('\nDetailed Risks:');
        mlRes.data.details.forEach(risk => {
            console.log(`- ${risk.type}: ${risk.risk}%`);
        });

        if (mlRes.data.details.length === 4) {
            console.log('\n✅ Integration: All 4 ML models are integrated.');
        } else {
            console.log('\n❌ Integration: Missing models in response.');
        }
    } catch (err) {
        console.log('❌ ML Integration Check Failed:', err.message);
        if (err.response) {
            console.log('   Response Status:', err.response.status);
            console.log('   Response Data:', err.response.data);
        }
    }
}

verifyMLIntegration();
