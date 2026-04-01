const Document = require('../models/Document');
const fs = require('fs');
const mongoose = require('mongoose');
const { resolvePatientId, sanitizeRegex } = require('../utils/healthUtils');

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const { category, title, description, tags } = req.body;

        const document = new Document({
            patientId: req.user.role === 'patient' ? req.user.id : req.body.patientId,
            category: category || 'Other',
            title: title || req.file.originalname,
            description: description || '',
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.user.id
        });

        await document.save();
        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all documents for a patient
// @route   GET /api/documents/patient/:patientId
// @access  Private
const getPatientDocuments = async (req, res, next) => {
    try {
        const patient = await resolvePatientId(req.params.patientId, req.user);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        if (req.user.role === 'patient' && patient.userId && patient.userId.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Forbidden');
        }

        const documents = await Document.find({ patientId: patient._id })
            .sort({ uploadDate: -1 })
            .populate('uploadedBy', 'name role');

        res.json(documents);
    } catch (error) {
        next(error);
    }
};

// @desc    Search/filter documents
// @route   GET /api/documents/search
// @access  Private
const searchDocuments = async (req, res, next) => {
    try {
        const { patientId, category, startDate, endDate, tags, query } = req.query;

        if (req.user.role === 'patient' && req.user.id !== patientId) {
            res.status(403);
            throw new Error('Forbidden');
        }

        let filter = { patientId };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (startDate || endDate) {
            filter.uploadDate = {};
            if (startDate) filter.uploadDate.$gte = new Date(startDate);
            if (endDate) filter.uploadDate.$lte = new Date(endDate);
        }

        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }

        if (query) {
            const safeQuery = sanitizeRegex(query);
            filter.$or = [
                { title: { $regex: safeQuery, $options: 'i' } },
                { description: { $regex: safeQuery, $options: 'i' } }
            ];
        }

        const documents = await Document.find(filter)
            .sort({ uploadDate: -1 })
            .populate('uploadedBy', 'name role');

        res.json(documents);
    } catch (error) {
        next(error);
    }
};

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            res.status(404);
            throw new Error('Document not found');
        }

        if (req.user.role === 'patient' && document.patientId.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Forbidden');
        }

        res.download(document.filePath, document.fileName);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            res.status(404);
            throw new Error('Document not found');
        }

        if (req.user.role === 'patient' && document.patientId.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Forbidden');
        }

        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get document statistics
// @route   GET /api/documents/stats/:patientId
// @access  Private
const getDocumentStats = async (req, res, next) => {
    try {
        if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
            res.status(403);
            throw new Error('Forbidden');
        }

        const stats = await Document.aggregate([
            { $match: { patientId: mongoose.Types.ObjectId(req.params.patientId) } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent documents
// @route   GET /api/documents/recent/:patientId
// @access  Private
const getRecentDocuments = async (req, res, next) => {
    try {
        if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
            res.status(403);
            throw new Error('Forbidden');
        }

        const documents = await Document.find({ patientId: req.params.patientId })
            .sort({ uploadDate: -1 })
            .limit(5)
            .select('title category fileName fileSize uploadDate mimeType');

        res.json(documents);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadDocument,
    getPatientDocuments,
    searchDocuments,
    downloadDocument,
    deleteDocument,
    getDocumentStats,
    getRecentDocuments
};
