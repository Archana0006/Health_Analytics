const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');

dotenv.config();

const populateEmptyDoctor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');

        const doctors = await User.find({ role: 'doctor' });
        if (doctors.length === 0) {
            console.log("No doctors found in the database. Please create a doctor account first.");
            process.exit(0);
        }

        console.log(`Found ${doctors.length} doctors. Generating dummy timeline data...`);

        // Create a dummy patient if none exists
        let dummyPatientUser = await User.findOne({ role: 'patient' });
        if (!dummyPatientUser) {
            dummyPatientUser = new User({
                name: 'Dummy Patient',
                email: 'dummy_patient_' + Date.now() + '@demo.com',
                password: 'password',
                role: 'patient'
            });
            await dummyPatientUser.save();
        }

        let demoPatientProfile = await Patient.findOne({ userId: dummyPatientUser._id });
        if (!demoPatientProfile) {
            demoPatientProfile = new Patient({
                hospitalPatientId: 'PT-' + Math.floor(100000 + Math.random() * 900000),
                userId: dummyPatientUser._id,
                name: dummyPatientUser.name,
                email: dummyPatientUser.email,
                vitals: { heightCm: 170, weightKg: 70, bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 72, temperatureC: 36.5 }
            });
            await demoPatientProfile.save();
        }

        // Add appointments and records for each doctor
        for (const doctor of doctors) {
            // Check if they already have appointments
            const existing = await Appointment.countDocuments({ doctorId: doctor._id });
            if (existing === 0) {
                const today = new Date();
                
                // Past visit (completed)
                const pastDate = new Date();
                pastDate.setDate(today.getDate() - 5);
                
                await Appointment.insertMany([
                    {
                        patientId: dummyPatientUser._id,
                        doctorId: doctor._id,
                        date: today,
                        time: '10:30',
                        status: 'scheduled',
                        reason: 'General Checkup'
                    },
                    {
                        patientId: dummyPatientUser._id,
                        doctorId: doctor._id,
                        date: today,
                        time: '14:00',
                        status: 'pending',
                        reason: 'Blood Test Results'
                    },
                    {
                        patientId: dummyPatientUser._id,
                        doctorId: doctor._id,
                        date: pastDate,
                        time: '09:00',
                        status: 'completed',
                        reason: 'Fever and Cough'
                    }
                ]);

                // Past medical record
                const soapRecord = new MedicalRecord({
                    patientId: demoPatientProfile._id,
                    doctorId: doctor._id,
                    diagnosis: 'Common Cold',
                    subjective: 'Patient reports fever.',
                    objective: 'Temp 38.5C.',
                    assessment: 'Viral infection.',
                    plan: 'Rest and hydration.',
                    createdAt: pastDate,
                    updatedAt: pastDate
                });
                await soapRecord.save();

                demoPatientProfile.medicalHistory.push(soapRecord._id);
                await demoPatientProfile.save();
                
                console.log(`✅ Timeline populated for Dr. ${doctor.name}`);
            } else {
                console.log(`⏩ Dr. ${doctor.name} already has data.`);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

populateEmptyDoctor();
