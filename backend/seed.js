const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const HealthRecord = require('./models/HealthRecord');
const Reminder = require('./models/Reminder');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');

        // Clear existing data
        await User.deleteMany({});
        await HealthRecord.deleteMany({});
        await Reminder.deleteMany({});
        await require('./models/Patient').deleteMany({});
        await require('./models/MedicalRecord').deleteMany({});
        await require('./models/Appointment').deleteMany({});
        await require('./models/Notification').deleteMany({});

        // Create Demo Admin
        const admin = new User({
            name: 'System Admin',
            email: 'admin@demo.com',
            password: 'password',
            role: 'admin'
        });
        await admin.save();

        // Create Demo Doctor
        const doctor = new User({
            name: 'Demo Doctor',
            email: 'doctor@demo.com',
            password: 'password',
            role: 'doctor'
        });
        await doctor.save();

        // Create Demo Patient (Matching Screenshot)
        const patientUser = new User({
            name: 'ARCHANA S',
            email: 'patient@demo.com',
            password: 'password',
            role: 'patient',
            age: 28,
            gender: 'Female'
        });
        await patientUser.save();

        const Patient = require('./models/Patient');
        const demoPatient = new Patient({
            hospitalPatientId: 'PT-998877',
            name: 'ARCHANA S',
            email: 'patient@demo.com',
            dob: new Date('1998-05-15'),
            gender: 'Female',
            vitals: {
                heightCm: 165,
                weightKg: 65,
                bloodPressure: { systolic: 155, diastolic: 95 },
                heartRate: 88,
                temperatureC: 37
            }
        });
        await demoPatient.save();

        // Add health records that result in a ~37% health score (Weighted Risk ~63)
        const records = [
            {
                patientId: patientUser._id, // Linked to User for simplicity in some charts
                doctorId: doctor._id,
                date: new Date('2026-02-11'),
                bloodPressure: { systolic: 155, diastolic: 95 },
                sugarLevel: 175,
                bmi: 29.5,
                heartRate: 88,
                cholesterol: 220,
                hemoglobin: 10.2,
                diagnosis: 'High risk monitoring required.',
            }
        ];
        await HealthRecord.insertMany(records);

        // Also create a MedicalRecord (SOAP) for the new unified system
        const MedicalRecord = require('./models/MedicalRecord');
        const soapRecord = new MedicalRecord({
            patientId: demoPatient._id,
            doctorId: doctor._id,
            diagnosis: 'Hypertension',
            subjective: 'Patient reports persistent headache.',
            objective: 'BP 155/95. HR 88.',
            assessment: 'Stage 2 Hypertension symptoms.',
            plan: 'Monitor vitals daily. Return in 2 weeks.',
            diagnoses: [{ code: 'I10', description: 'Essential hypertension' }]
        });
        await soapRecord.save();

        // Link MedicalRecord to Patient
        demoPatient.medicalHistory.push(soapRecord._id);
        await demoPatient.save();

        // Add 2 Appointments (Matching Screenshot)
        const Appointment = require('./models/Appointment');
        const appointments = [
            {
                patientId: patientUser._id,
                doctorId: doctor._id,
                date: new Date('2026-12-21'),
                time: '10:00',
                status: 'pending',
                reason: 'Follow-up'
            },
            {
                patientId: patientUser._id,
                doctorId: doctor._id,
                date: new Date('2026-12-21'),
                time: '14:00',
                status: 'pending',
                reason: 'Routine Checkup'
            }
        ];
        await Appointment.insertMany(appointments);

        // No Active Reminders (Matching Screenshot)
        await Reminder.deleteMany({ userId: patientUser._id });

        // Add 1 Specific Alert (Matching Screenshot)
        const Notification = require('./models/Notification');
        await Notification.deleteMany({ userId: patientUser._id });
        const notifications = [
            {
                userId: patientUser._id,
                message: 'Alert: High blood pressure detected (200/120). Please consult your doctor.',
                type: 'alert'
            }
        ];
        await Notification.insertMany(notifications);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
