const axios = require('axios');

async function testDoctorList() {
    try {
        // First, login to get a valid token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'patient@demo.com',
            password: 'password'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // Now fetch the doctor list with the token
        const doctorRes = await axios.get('http://localhost:5000/api/doctor/list', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`\n✅ Doctor list fetched successfully!`);
        console.log(`📊 Total doctors: ${doctorRes.data.length}\n`);

        doctorRes.data.forEach((doctor, index) => {
            console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization || 'General'}`);
            console.log(`   Email: ${doctor.email}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDoctorList();
