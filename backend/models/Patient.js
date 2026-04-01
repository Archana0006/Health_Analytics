const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    hospitalPatientId: { type: String, required: true, unique: true }, // hospital style ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked user account
    name: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String },
    phoneNumber: { type: String },
    email: { type: String, unique: true, sparse: true },
    allergies: [{ type: String }],
    vitals: {
        heightCm: Number,
        weightKg: Number,
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        heartRate: Number,
        temperatureC: Number
    },
    medicalHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on each save
patientSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Optimization for Clinical Triage & Risk Scanning
patientSchema.index({ 'vitals.bloodPressure.systolic': 1 });
patientSchema.index({ 'vitals.sugarLevel': 1 });

module.exports = mongoose.model('Patient', patientSchema);
