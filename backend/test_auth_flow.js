const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'testpassword123';

const runTest = async () => {
    console.log(`Starting test with email: ${testEmail}`);

    try {
        // 1. Signup
        console.log('Attempting Signup...');
        const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test User',
            email: testEmail,
            password: testPassword,
            role: 'patient'
        });
        console.log('Signup Response:', signupRes.data);

        // 2. Login
        console.log('Attempting Login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testEmail,
            password: testPassword
        });
        console.log('Login Response:', loginRes.data);
        console.log('TEST PASSED: Login successful after registration.');

    } catch (error) {
        console.error('TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

runTest();
