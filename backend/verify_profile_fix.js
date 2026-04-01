const mongoose = require('mongoose');
const { resolvePatientId } = require('./utils/healthUtils');
const { User, Patient } = require('./models');
const dotenv = require('dotenv');
dotenv.config();

const userId = '69aaf9495296a0d55f6afe7f'; // The user we know is missing a patient profile

async function verifyFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');
        console.log('Connected to MongoDB');

        console.log('--- Before Resolution ---');
        const user = await User.findById(userId);
        const initialPatient = await Patient.findOne({ email: user.email });
        console.log('Patient exists initially:', !!initialPatient);

        console.log('\n--- Calling resolvePatientId ---');
        const resolvedPatient = await resolvePatientId(userId, { id: userId, role: 'patient', email: user.email });
        console.log('Resolved Patient:', resolvedPatient ? 'SUCCESS' : 'FAILED');
        if (resolvedPatient) {
            console.log('Hospital ID:', resolvedPatient.hospitalPatientId);
            console.log('Email:', resolvedPatient.email);
        }

        console.log('\n--- After Resolution (Double Check DB) ---');
        const finalPatient = await Patient.findOne({ email: user.email });
        console.log('Patient exists in DB now:', !!finalPatient);

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFix();
