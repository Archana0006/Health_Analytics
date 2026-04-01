const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isDoctor, isAdmin } = require('../middleware/roleMiddleware');
const { doctorManagementValidationRules, validate } = require('../middleware/validationMiddleware');
const {
    getDoctorStats,
    getDoctorList,
    manageDoctor,
    deleteDoctor,
    getCriticalPatients
} = require('../controllers/doctorController');

router.get('/stats', auth, isDoctor, getDoctorStats);
router.get('/list', auth, getDoctorList);
router.post('/manage', auth, isAdmin, doctorManagementValidationRules(), validate, manageDoctor);
router.put('/manage/:id', auth, isAdmin, doctorManagementValidationRules(), validate, manageDoctor); // Reused manageDoctor for update
router.delete('/manage/:id', auth, isAdmin, deleteDoctor);
router.get('/critical-patients', auth, isDoctor, getCriticalPatients);

module.exports = router;
