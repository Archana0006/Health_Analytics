const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { recordValidationRules, mongoIdValidationRules, validate } = require('../middleware/validationMiddleware');
const { logAudit } = require('../middleware/auditMiddleware');
const {
    createRecord,
    getPatientRecords,
    getHealthReport,
    getMLScore,
    updateRecord,
    deleteRecord
} = require('../controllers/recordController');
const multer = require('multer');

const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const getRecordAuditInfo = (req, resData) => {
    return {
        entity: 'MedicalRecord',
        entityId: resData._id || req.params.id,
        details: { patientId: resData.patientId || req.body.patientId }
    };
};

router.post('/', auth, upload.array('attachments'), recordValidationRules(), validate, logAudit('create', getRecordAuditInfo), createRecord);
router.get('/patient/:patientId', auth, mongoIdValidationRules('patientId'), validate, getPatientRecords);
router.get('/report/:patientId', auth, mongoIdValidationRules('patientId'), validate, getHealthReport);
router.get('/ml-score/:patientId', auth, mongoIdValidationRules('patientId'), validate, getMLScore);
router.put('/:id', auth, mongoIdValidationRules('id'), recordValidationRules(), validate, logAudit('update', getRecordAuditInfo), updateRecord);
router.delete('/:id', auth, mongoIdValidationRules('id'), validate, logAudit('delete', getRecordAuditInfo), deleteRecord);

module.exports = router;
