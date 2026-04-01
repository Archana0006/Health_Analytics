const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    // Vitals
    bloodPressure: {
        systolic: Number,
        diastolic: Number
    },
    sugarLevel: Number,
    heartRate: Number,
    bmi: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    diagnosis: { type: String, required: true },
    // SOAP note fields
    subjective: { type: String },
    objective: { type: String },
    assessment: { type: String },
    plan: { type: String },
    // Diagnoses and procedures (use standard coding systems)
    diagnoses: [{ code: String, description: String }],
    procedures: [{ code: String, description: String }],
    // Medications prescribed in this visit
    medications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    // Attachments such as PDFs, images
    attachments: [{ type: String }], // URLs or file paths
}, { timestamps: true });

// Performance Indexes
medicalRecordSchema.index({ patientId: 1, date: -1 }); // Optimized for finding patient records sorted by date
medicalRecordSchema.index({ doctorId: 1, date: -1 });  // Optimized for finding records created by a doctor

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
