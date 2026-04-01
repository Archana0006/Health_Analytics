const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
    labTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resultData: { type: String }, // could be JSON string or formatted text
    resultValues: [{
        name: String,
        value: String,
        unit: String,
        referenceRange: String,
        flag: { type: String, enum: ['normal', 'high', 'low', 'critical'] }
    }],
    abnormal: { type: Boolean, default: false },
    reportedAt: { type: Date, default: Date.now },
    comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LabResult', labResultSchema);
