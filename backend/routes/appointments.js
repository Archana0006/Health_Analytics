const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { appointmentValidationRules, validate } = require('../middleware/validationMiddleware');
const { logAudit } = require('../middleware/auditMiddleware');
const {
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    getUpcomingAppointments
} = require('../controllers/appointmentController');

const getAppointmentAuditInfo = (req, resData) => {
    return {
        entity: 'Appointment',
        entityId: resData._id || req.params.id,
        details: req.body
    };
};

router.post('/', auth, appointmentValidationRules(), validate, logAudit('create', getAppointmentAuditInfo), createAppointment);
router.get('/patient/:id', auth, getPatientAppointments);
router.get('/doctor/:id', auth, getDoctorAppointments);
router.put('/status/:id', auth, logAudit('update', getAppointmentAuditInfo), updateAppointmentStatus);
router.get('/upcoming/:userId', auth, getUpcomingAppointments);

module.exports = router;
