const mongoose = require('mongoose');
const User = require('./backend/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function checkDoctors() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all doctors
        const doctors = await User.find({ role: 'doctor' }).select('name email specialization role');

        console.log(`📊 Total doctors in database: ${doctors.length}\n`);

        if (doctors.length === 0) {
            console.log('❌ No doctors found in database!');
        } else {
            console.log('Doctors found:');
            doctors.forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name}`);
                console.log(`   Email: ${doctor.email}`);
                console.log(`   Specialization: ${doctor.specialization || 'Not specified'}`);
                console.log(`   Role: ${doctor.role}`);
                console.log('');
            });
        }

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDoctors();
