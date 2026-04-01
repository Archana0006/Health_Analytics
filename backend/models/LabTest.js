const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
    testCode: { type: String }, // optional standard code (e.g., LOINC)
    orderedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ordered', 'in_progress', 'completed', 'cancelled'], default: 'ordered' },
    // Additional fields for sample collection
    sampleCollectedAt: { type: Date },
    sampleType: { type: String },
    // Reference to result (populated later)
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabResult' }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
