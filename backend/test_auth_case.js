const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const testEmailMixed = `Test_${Date.now()}@Example.com`;
const testEmailLower = testEmailMixed.toLowerCase();
const testPassword = 'testpassword123';

const runTest = async () => {
    console.log(`Starting case-sensitivity test.`);
    console.log(`Registering with: ${testEmailMixed}`);

    try {
        // 1. Signup
        console.log('Attempting Signup...');
        await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test Case User',
            email: testEmailMixed,
            password: testPassword,
            role: 'patient'
        });
        console.log('Signup Successful.');

        // 2. Login with Lowercase
        console.log(`Attempting Login with: ${testEmailLower}`);
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testEmailLower,
            password: testPassword
        });
        console.log('Login Response:', loginRes.data);
        console.log('TEST RESULT: Case-insensitive login works.');

    } catch (error) {
        console.log('TEST RESULT: Case-insensitive login FAILED.');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
};

runTest();
