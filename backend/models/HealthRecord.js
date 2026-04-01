const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    bloodPressure: {
        systolic: Number,
        diastolic: Number
    },
    sugarLevel: Number,
    bmi: Number,
    heartRate: Number,
    cholesterol: Number,
    hemoglobin: Number,
    diagnosis: String,
    prescription: String,
    notes: String,
    attachments: [String] // URLs or file paths to PDFs
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
