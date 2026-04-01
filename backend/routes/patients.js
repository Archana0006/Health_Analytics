const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isStaff, isAdmin } = require('../middleware/roleMiddleware');
const { patientValidationRules, mongoIdValidationRules, validate } = require('../middleware/validationMiddleware');
const { logAudit } = require('../middleware/auditMiddleware');
const {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');

// Helper to extract entity info for AuditLog
const getPatientAuditInfo = (req, resData) => {
    return {
        entity: 'Patient',
        entityId: resData.patient ? resData.patient._id : req.params.id,
        details: req.body
    };
};

router.get('/', auth, isStaff, getAllPatients);
router.get('/:id', auth, mongoIdValidationRules('id'), validate, getPatientById);

router.post('/', auth, isStaff, patientValidationRules(), validate, logAudit('create', getPatientAuditInfo), createPatient);
router.put('/:id', auth, isStaff, mongoIdValidationRules('id'), patientValidationRules(), validate, logAudit('update', getPatientAuditInfo), updatePatient);
router.delete('/:id', auth, isStaff, mongoIdValidationRules('id'), validate, logAudit('delete', getPatientAuditInfo), deletePatient);

module.exports = router;
