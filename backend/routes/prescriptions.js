const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isStaff } = require('../middleware/roleMiddleware');
const { prescriptionValidationRules, validate } = require('../middleware/validationMiddleware');
const {
    createPrescription,
    getPatientPrescriptions,
    updatePrescription,
    deletePrescription
} = require('../controllers/prescriptionController');

router.post('/', auth, isStaff, prescriptionValidationRules(), validate, createPrescription);
router.get('/patient/:patientId', auth, getPatientPrescriptions);
router.put('/:id', auth, isStaff, prescriptionValidationRules(), validate, updatePrescription);
router.delete('/:id', auth, isStaff, deletePrescription);

module.exports = router;
