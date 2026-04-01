const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const doctors = [
    {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: 'password',
        role: 'doctor',
        specialization: 'Cardiology',
        phone: '+1-555-0101',
        address: '123 Medical Plaza, New York, NY 10001'
    },
    {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        password: 'password',
        role: 'doctor',
        specialization: 'Endocrinology',
        phone: '+1-555-0102',
        address: '456 Health Center, Los Angeles, CA 90001'
    },
    {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@hospital.com',
        password: 'password',
        role: 'doctor',
        specialization: 'General Medicine',
        phone: '+1-555-0103',
        address: '789 Wellness Ave, Chicago, IL 60601'
    },
    {
        name: 'Dr. James Wilson',
        email: 'james.wilson@hospital.com',
        password: 'password',
        role: 'doctor',
        specialization: 'Neurology',
        phone: '+1-555-0104',
        address: '321 Care Street, Houston, TX 77001'
    },
    {
        name: 'Dr. Priya Patel',
        email: 'priya.patel@hospital.com',
        password: 'password',
        role: 'doctor',
        specialization: 'Pediatrics',
        phone: '+1-555-0105',
        address: '654 Family Clinic Rd, Phoenix, AZ 85001'
    }
];

async function seedDoctors() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if doctors already exist
        const existingDoctors = await User.find({ role: 'doctor' });
        console.log(`Found ${existingDoctors.length} existing doctors in database`);

        // Add new doctors
        let addedCount = 0;
        for (const doctorData of doctors) {
            const exists = await User.findOne({ email: doctorData.email });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(doctorData.password, 10);
                const doctor = new User({
                    ...doctorData,
                    password: hashedPassword
                });
                await doctor.save();
                console.log(`✅ Added: ${doctorData.name} (${doctorData.specialization})`);
                addedCount++;
            } else {
                console.log(`⏭️  Skipped: ${doctorData.name} (already exists)`);
            }
        }

        console.log(`\n✅ Seeding complete! Added ${addedCount} new doctors.`);
        console.log(`📊 Total doctors in database: ${existingDoctors.length + addedCount}`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding doctors:', error);
        process.exit(1);
    }
}

seedDoctors();
