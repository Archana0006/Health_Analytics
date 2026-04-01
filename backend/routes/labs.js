const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin, isStaff } = require('../middleware/roleMiddleware');
const { labTestValidationRules, validate } = require('../middleware/validationMiddleware');
const { logAudit } = require('../middleware/auditMiddleware');
const {
    orderTest,
    getPatientTests,
    getAllTests,
    uploadResult
} = require('../controllers/labController');

const getLabTestAuditInfo = (req, resData) => {
    return {
        entity: 'LabTest',
        entityId: resData._id || req.body.labTestId,
        details: { testName: req.body.testName || 'Upload Result' }
    };
};

router.post('/tests', auth, isStaff, labTestValidationRules(), validate, logAudit('create', getLabTestAuditInfo), orderTest);
router.get('/tests', auth, isAdmin, getAllTests);
router.get('/tests/patient/:patientId', auth, getPatientTests);
router.post('/results', auth, isAdmin, validate, logAudit('create', getLabTestAuditInfo), uploadResult);

module.exports = router;
