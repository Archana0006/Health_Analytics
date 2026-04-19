const { MedicalRecord, HealthRecord, Patient, Notification, User, AuditLog } = require('../models');
const notificationService = require('../services/notificationService');
const { generateHealthReport } = require('../utils/reportGenerator');
const { resolvePatientId } = require('../utils/healthUtils');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// @desc    Create a new medical record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res, next) => {
    try {
        const { patientId, diagnosis, bloodPressure, sugarLevel, heartRate, bmi, temperature, weight, height } = req.body;

        console.log('Creating Record - Body:', req.body);
        console.log('Creating Record - Files:', req.files);

        // Handle nested fields from FormData (e.g. bloodPressure[systolic])
        let bp = bloodPressure;
        if (!bp && req.body['bloodPressure[systolic]']) {
            bp = {
                systolic: req.body['bloodPressure[systolic]'],
                diastolic: req.body['bloodPressure[diastolic]']
            };
        }

        // Find patient to ensure they exist and to update vitals
        const patient = await resolvePatientId(patientId, req.user);
        if (!patient) {
            console.error(`Create Record Failed: Patient not found for ID ${patientId}`);
            return res.status(404).json({ error: 'Patient not found. Please ensure the patient profile exists.' });
        }

        // Auth check: Staff can add to any patient, patients can only add to themselves
        if (req.user.role === 'patient') {
            if (patient.userId && patient.userId.toString() !== req.user.id.toString()) {
                console.error(`Create Record Forbidden: User ${req.user.id} tried to add record for patient ${patient._id}`);
                res.status(403);
                throw new Error('Not authorized to add records for this patient');
            }
        }

        const attachments = req.files ? req.files.map(file => file.path) : [];

        const record = new MedicalRecord({
            patientId: patient._id, // Use the actual Patient document ID
            doctorId: req.user.role === 'patient' ? null : (req.body.doctorId || req.user.id),
            diagnosis,
            bloodPressure: bp,
            sugarLevel,
            heartRate,
            bmi,
            temperature,
            weight,
            height,
            attachments,
            date: new Date()
        });

        await record.save();

        // Update patient's current vitals if provided in the record
        if (bp || sugarLevel || weight || height) {
            if (!patient.vitals) patient.vitals = {};
            if (bp) patient.vitals.bloodPressure = bp;
            if (sugarLevel) patient.vitals.sugarLevel = sugarLevel;
            if (weight) patient.vitals.weightKg = weight;
            if (height) patient.vitals.heightCm = height;
            await patient.save();
        }

        // Delegate to Health Risk Engine (Transitioning to Service Layer)
        if (bp || sugarLevel) {
            await notificationService.processClinicalAlerts(patient, { bloodPressure: bp, sugarLevel });
        }

        // Create Audit Log for clinical data modification
        await AuditLog.create({
            action: 'create',
            entity: 'MedicalRecord',
            entityId: record._id,
            performedBy: req.user.id,
            details: { diagnosis: record.diagnosis }
        });

        res.status(201).json(record);
    } catch (error) {
        next(error);
    }
};

// resolvePatientId moved to healthUtils.js

// @desc    Get all records for a patient
// @route   GET /api/records/patient/:patientId
// @access  Private
const getPatientRecords = async (req, res, next) => {
    try {
        const patient = await resolvePatientId(req.params.patientId, req.user);
        if (!patient) {
            res.status(404);
            throw new Error('Patient record not found');
        }

        // Authorization check
        if (req.user.role === 'patient' && patient.userId && patient.userId.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to view these records');
        }

        // Fetch both HealthRecords (vitals) and MedicalRecords (SOAP)
        const [healthRecords, medicalRecords] = await Promise.all([
            HealthRecord.find({
                $or: [{ patientId: patient._id }, { patientId: req.params.patientId }]
            }).sort({ date: -1 }).lean(),
            MedicalRecord.find({
                $or: [{ patientId: patient._id }, { patientId: req.params.patientId }]
            }).populate('doctorId', 'name email').sort({ date: -1 }).lean()
        ]);
        console.log(`Debug Health Records: ${healthRecords.length}, Medical Records: ${medicalRecords.length}`);

        // Return combined data sorted by date descending
        const allRecords = [...healthRecords, ...medicalRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allRecords);
    } catch (error) {
        next(error);
    }
};

// @desc    Generate PDF Health Report
// @route   GET /api/records/report/:patientId
// @access  Private
const getHealthReport = async (req, res, next) => {
    try {
        const patient = await resolvePatientId(req.params.patientId, req.user);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        const patientIdValue = patient._id;
        const alternativeId = req.params.patientId;

        const [medicalRecords, labTests, prescriptions, healthRecords] = await Promise.all([
            MedicalRecord.find({ $or: [{ patientId: patientIdValue }, { patientId: alternativeId }] }).sort({ date: -1 }).limit(5).lean(),
            require('../models/LabTest').find({ $or: [{ patientId: patientIdValue }, { patientId: alternativeId }] }).sort({ orderedAt: -1 }).limit(5).populate('resultId').lean(),
            require('../models/Prescription').find({ $or: [{ patientId: patientIdValue }, { patientId: alternativeId }] }).sort({ startDate: -1 }).limit(10).lean(),
            HealthRecord.find({ $or: [{ patientId: patientIdValue }, { patientId: alternativeId }] }).sort({ date: -1 }).limit(5).lean()
        ]);

        // Prioritize healthRecords for the report generator as it expects vitals
        const reportRecords = healthRecords.length > 0 ? healthRecords : medicalRecords;

        const fileName = `report_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        await generateHealthReport(patient, reportRecords, filePath, { labTests, prescriptions });

        res.download(filePath, 'HealthReport.pdf', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting report:', unlinkErr);
            });
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get ML Health Score & Insights
// @route   GET /api/records/ml-score/:patientId
// @access  Private
const getMLScore = async (req, res, next) => {
    try {
        if (req.user.role === 'patient') {
            const patientDoc = await Patient.findOne({ userId: req.user.id });
            if (!patientDoc || patientDoc._id.toString() !== req.params.patientId) {
                res.status(403);
                throw new Error('Not authorized');
            }
        }

        const patient = await Patient.findById(req.params.patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const age = patient.age || 35; // You might want to calculate age from DOB in Patient model
        const gender = patient.gender || 'Male';
        const vitals = patient.vitals || {};

        try {
              const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
              const [diabetesRes, heartRes, hypertensionRes, anemiaRes] = await Promise.all([
                  axios.post(`${mlServiceUrl}/predict/diabetes`, {
                    bmi: (vitals.weightKg / Math.pow(vitals.heightCm / 100, 2)) || 25,
                    sugar: 100, // Fetch from Labs
                    age: age
                }),
                axios.post(`${mlServiceUrl}/predict/heart-disease`, {
                    blood_pressure: vitals.bloodPressure?.systolic || 120,
                    cholesterol: 180, // Fetch from Labs
                    age: age
                }),
                axios.post(`${mlServiceUrl}/predict/hypertension`, {
                    blood_pressure: vitals.bloodPressure?.systolic || 120,
                    age: age
                }),
                axios.post(`${mlServiceUrl}/predict/anemia`, {
                    hemoglobin: 14, // Fetch from Labs
                    age: age,
                    gender: gender
                })
            ]);

            const risks = [
                { name: 'Diabetes', score: diabetesRes.data.risk_score, weight: 1 },
                { name: 'Heart Disease', score: heartRes.data.risk_score, weight: 1.5 },
                { name: 'Hypertension', score: hypertensionRes.data.risk_score, weight: 1.2 },
                { name: 'Anemia', score: anemiaRes.data.risk_score, weight: 0.8 }
            ];

            const totalWeight = risks.reduce((sum, r) => sum + r.weight, 0);
            const weightedRisk = risks.reduce((sum, r) => sum + (r.score * r.weight), 0) / totalWeight;
            const healthScore = 100 - weightedRisk;

            const allRecommendations = [
                diabetesRes.data.recommendation,
                heartRes.data.recommendation,
                hypertensionRes.data.recommendation,
                anemiaRes.data.recommendation
            ].filter(rec => !rec.includes('Healthy') && !rec.includes('Maintain a healthy diet')).join(' ');

            res.json({
                score: Math.round(healthScore) + '%',
                recommendation: allRecommendations || 'All metrics look good! Continue your healthy lifestyle.',
                details: risks.map(r => ({ type: r.name, risk: r.score }))
            });
        } catch (mlErr) {
            console.error('ML Service Error:', mlErr.message);
            // Fallback score
            let bpScore = 100;
            if (vitals.bloodPressure?.systolic > 140) bpScore = 60;
            else if (vitals.bloodPressure?.systolic > 130) bpScore = 80;

            res.json({
                score: Math.round(bpScore) + '%',
                recommendation: 'Showing heuristic score. ML Service offline.'
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a medical record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) {
            res.status(404);
            throw new Error('Record not found');
        }

        if (req.user.role === 'patient') {
            const patientDoc = await require('../models/Patient').findOne({ userId: req.user.id });
            if (!patientDoc || record.patientId.toString() !== patientDoc._id.toString()) {
                res.status(403);
                throw new Error('Not authorized to edit this record');
            }
            // Optionally, restrict editing doctor notes:
            if (record.doctorId) {
                res.status(403);
                throw new Error('Not authorized to edit clinical notes added by a doctor');
            }
        }

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedRecord);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) {
            res.status(404);
            throw new Error('Record not found');
        }

        if (req.user.role === 'patient') {
            const patientDoc = await require('../models/Patient').findOne({ userId: req.user.id });
            if (!patientDoc || record.patientId.toString() !== patientDoc._id.toString()) {
                res.status(403);
                throw new Error('Not authorized to delete this record');
            }
            if (record.doctorId) {
                res.status(403);
                throw new Error('Not authorized to delete clinical notes added by a doctor');
            }
        }

        await MedicalRecord.findByIdAndDelete(req.params.id);

        // Audit Log for deletion
        await AuditLog.create({
            action: 'delete',
            entity: 'MedicalRecord',
            entityId: req.params.id,
            performedBy: req.user.id
        });

        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRecord,
    getPatientRecords,
    getHealthReport,
    getMLScore,
    updateRecord,
    deleteRecord
};
