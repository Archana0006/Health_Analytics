const axios = require('axios');

const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGM0Yjg0OTc0NGM4NmI3NGM1NmQzZiIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzcwODY3Mzc4LCJleHAiOjE3NzA5NTM3Nzh9._ATLAZCDTEAIJRwui5XLQQ9MM9sUQLdZj2O5JEWEl58';
const PATIENT_ID = '698c4b849744c86b74c56d3f';
const DOCTOR_ID = '698c4b849744c86b74c56d3d';
const BASE_URL = 'http://localhost:5000/api/appointments';

async function testAppointments() {
    try {
        console.log('--- Testing Appointment Creation ---');
        const createRes = await axios.post(BASE_URL, {
            doctorId: DOCTOR_ID,
            date: '2026-05-20',
            time: '10:00',
            reason: 'Annual Checkup'
        }, {
            headers: { Authorization: `Bearer ${PATIENT_TOKEN}` }
        });
        const appointmentId = createRes.data._id;
        console.log('✅ Appointment Created:', appointmentId);

        console.log('\n--- Testing Get Patient Appointments ---');
        const patientApps = await axios.get(`${BASE_URL}/patient/${PATIENT_ID}`, {
            headers: { Authorization: `Bearer ${PATIENT_TOKEN}` }
        });
        console.log('✅ Found Appointments:', patientApps.data.length);

        console.log('\n--- Testing Status Update (Doctor Simulation) ---');
        // Note: Using patient token here for simplicity if backend doesn't check role strictly for this test,
        // but in real use, doctor role would be required.
        const statusRes = await axios.put(`${BASE_URL}/status/${appointmentId}`, {
            status: 'approved'
        }, {
            headers: { Authorization: `Bearer ${PATIENT_TOKEN}` }
        });
        console.log('✅ Status Updated:', statusRes.data.status);

    } catch (err) {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    }
}

testAppointments();
