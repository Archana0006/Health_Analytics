const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'completed', 'cancelled'],
        default: 'pending'
    },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Performance Indexes
appointmentSchema.index({ patientId: 1, date: -1 }); // Optimized for finding patient's appointments sorted by date
appointmentSchema.index({ doctorId: 1, date: -1 });  // Optimized for finding doctor's appointments sorted by date

module.exports = mongoose.model('Appointment', appointmentSchema);
