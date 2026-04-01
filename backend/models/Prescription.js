const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g., '500 mg'
    frequency: { type: String, required: true }, // e.g., 'twice a day'
    durationDays: { type: Number },
    route: { type: String }, // oral, IV, etc.
    instructions: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    // Alerts for allergies or drug interactions can be derived in service layer
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
