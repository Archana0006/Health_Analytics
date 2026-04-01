const mongoose = require('mongoose');
const { User, Patient } = require('./models');
const dotenv = require('dotenv');
dotenv.config();

const userId = '69aaf9495296a0d55f6afe7f';

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');
        console.log('Connected to MongoDB');

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found in database.');
            return;
        }
        console.log('User found:', { id: user._id, email: user.email, role: user.role });

        const patientDirect = await Patient.findById(userId);
        console.log('Patient by ID (direct):', patientDirect ? 'FOUND' : 'NOT FOUND');

        const patientByEmail = await Patient.findOne({ email: user.email });
        console.log('Patient by email:', patientByEmail ? 'FOUND' : 'NOT FOUND');
        
        if (patientByEmail) {
            console.log('Patient Details:', { id: patientByEmail._id, email: patientByEmail.email });
        } else {
            // List all patients to see what we have
            const allPatients = await Patient.find({}, 'email name');
            console.log('All Patients in DB:', allPatients);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
