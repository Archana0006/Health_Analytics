const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    uploadDocument,
    getPatientDocuments,
    searchDocuments,
    downloadDocument,
    deleteDocument,
    getDocumentStats,
    getRecentDocuments
} = require('../controllers/documentController');

// Configure multer for document uploads with category-based folders
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category || 'Other';
        const categoryFolder = category.replace(/\s+/g, '_').toLowerCase();
        const uploadPath = path.join('uploads', 'documents', categoryFolder);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Strip all characters that are not letters, numbers, hyphen, or underscore,
        // then prefix with a safe name to neutralise any XSS or path-traversal attempt.
        const safeName = `document_${Date.now()}${ext}`;
        cb(null, safeName);
    }
});

// Explicit whitelist: maps allowed extension to its canonical MIME type.
// Using a map (not a loose regex) prevents bypass via crafted filenames.
const ALLOWED_MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedMime = ALLOWED_MIME_TYPES[ext];

        // Both the extension AND the actual MIME type must match the whitelist entry.
        if (allowedMime && file.mimetype === allowedMime) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, png), PDFs, and Word documents (doc, docx) are allowed'));
    }
});

const { documentUploadValidationRules, mongoIdValidationRules, validate } = require('../middleware/validationMiddleware');

router.post('/upload', auth, upload.single('file'), uploadDocument);
router.get('/patient/:patientId', auth, mongoIdValidationRules('patientId'), validate, getPatientDocuments);
router.get('/search', auth, searchDocuments);
router.get('/:id/download', auth, mongoIdValidationRules('id'), validate, downloadDocument);
router.delete('/:id', auth, mongoIdValidationRules('id'), validate, deleteDocument);
router.get('/stats/:patientId', auth, mongoIdValidationRules('patientId'), validate, getDocumentStats);
router.get('/recent/:patientId', auth, mongoIdValidationRules('patientId'), validate, getRecentDocuments);

module.exports = router;
