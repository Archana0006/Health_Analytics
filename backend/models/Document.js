const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Lab Report', 'Prescription', 'Medical Imaging', 'Insurance', 'Other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    filePath: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

// Index for faster searches
documentSchema.index({ patientId: 1, category: 1 });
documentSchema.index({ patientId: 1, uploadDate: -1 });
documentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', documentSchema);
