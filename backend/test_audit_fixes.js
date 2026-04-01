const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Patient, MedicalRecord, Notification } = require('./models');
const { resolvePatientId } = require('./utils/healthUtils');

dotenv.config();

async function runTest() {
    try {
        console.log('--- Starting Audit Fix Verification ---');
        
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create a test user
        const testEmail = `test_${Date.now()}@example.com`;
        const user = new User({
            name: 'Test Patient',
            email: testEmail,
            password: 'password123',
            role: 'patient'
        });
        await user.save();
        console.log('Created test user:', testEmail);

        // 2. Resolve patient (should auto-create profile with userId)
        const patient = await resolvePatientId(user._id, { id: user._id, role: 'patient', email: testEmail });
        if (patient && patient.userId && patient.userId.toString() === user._id.toString()) {
            console.log('SUCCESS: Patient profile created/resolved with correct userId.');
        } else {
            console.error('FAILURE: Patient profile resolution failed or userId mismatch.');
            console.log('Patient:', patient);
        }

        // 3. Create a medical record and check notification
        const record = new MedicalRecord({
            patientId: patient._id,
            diagnosis: 'Verification Test',
            bloodPressure: { systolic: 150, diastolic: 95 }, // High BP to trigger alert
            date: new Date()
        });
        await record.save();
        console.log('Created medical record with high BP.');

        // Update patient vitals (simulating recordController logic)
        patient.vitals.bloodPressure = record.bloodPressure;
        await patient.save();

        // Manual notification check (simulating logic from recordController)
        const notificationMsg = `Alert: High blood pressure detected (${record.bloodPressure.systolic}/${record.bloodPressure.diastolic}).`;
        const notification = new Notification({
            userId: patient.userId, // Should be User ID
            message: notificationMsg,
            type: 'alert'
        });
        await notification.save();
        console.log('Created notification with userId:', notification.userId);

        if (notification.userId.toString() === user._id.toString()) {
            console.log('SUCCESS: Notification userId matches User ID.');
        } else {
            console.error('FAILURE: Notification userId mismatch.');
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Patient.deleteOne({ _id: patient._id });
        await MedicalRecord.deleteOne({ _id: record._id });
        await Notification.deleteOne({ _id: notification._id });
        console.log('Cleaned up test data.');

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

runTest();
