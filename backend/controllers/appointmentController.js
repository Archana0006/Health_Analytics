const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { resolvePatientId } = require('../utils/healthUtils');

// Helper to auto-complete past appointments
const checkAndUpdateStatus = (appointments) => {
    const now = new Date();
    appointments.forEach(appt => {
        if (appt.status === 'pending' || appt.status === 'approved') {
            const apptDate = new Date(appt.date);
            if (appt.time) {
                const [hours, minutes] = appt.time.split(':');
                apptDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
            }
            if (apptDate < now) {
                appt.status = 'completed';
                Appointment.updateOne({ _id: appt._id }, { status: 'completed' }).catch(err => console.error('Auto-complete error:', err));
            }
        }
    });
    return appointments;
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
    try {
        const { doctorId, date, time, reason, patientId } = req.body;
        const appointment = new Appointment({
            patientId: req.user.role === 'patient' ? req.user.id : (patientId || req.user.id),
            doctorId,
            date,
            time,
            reason
        });
        await appointment.save();

        // Notify doctor
        const notificationMsg = `New appointment request for ${new Date(date).toLocaleDateString()} at ${time}`;
        const notification = new Notification({
            userId: doctorId,
            message: notificationMsg,
            type: 'appointment'
        });
        await notification.save();

        // Emit real-time socket notification
        require('../utils/socket').sendNotification(doctorId, {
            message: notificationMsg,
            type: 'appointment',
            createdAt: notification.createdAt
        });

        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get appointments for a patient
// @route   GET /api/appointments/patient/:id
// @access  Private
const getPatientAppointments = async (req, res, next) => {
    try {
        let searchId = req.params.id;

        if (req.user.role === 'patient') {
            // IDOR Protection: Patients can ONLY see their own appointments
            searchId = req.user.id;
        } else {
            // For Doctors/Admins, if the provided ID is from the Patient collection, 
            // map it to the corresponding User ID, because Appointment schema refs User.
            const PatientModel = require('../models/Patient');
            const UserModel = require('../models/User');

            const patient = await PatientModel.findById(searchId).catch(() => null);
            if (patient) {
                const user = await UserModel.findOne({ email: patient.email });
                if (user) {
                    searchId = user._id; // Use mapped User ID
                } else {
                    res.status(404);
                    throw new Error('Associated user account not found for this patient profile');
                }
            }
        }

        let appointments = await Appointment.find({ patientId: searchId })
            .populate('doctorId', 'name email address')
            .sort({ date: -1 })
            .lean();
            
        appointments = checkAndUpdateStatus(appointments);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get appointments for a doctor
// @route   GET /api/appointments/doctor/:id
// @access  Private
const getDoctorAppointments = async (req, res, next) => {
    try {
        let appointments = await Appointment.find({ doctorId: req.params.id })
            .populate('patientId', 'name email age gender')
            .sort({ date: -1 })
            .lean();
            
        appointments = checkAndUpdateStatus(appointments);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/status/:id
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404);
            throw new Error('Appointment not found');
        }

        appointment.status = status;
        await appointment.save();

        // Notify patient
        const notificationMsg = `Your appointment for ${new Date(appointment.date).toLocaleDateString()} has been ${status}`;
        const notification = new Notification({
            userId: appointment.patientId,
            message: notificationMsg,
            type: 'appointment'
        });
        await notification.save();

        // Emit real-time socket notification
        require('../utils/socket').sendNotification(appointment.patientId, {
            message: notificationMsg,
            type: 'appointment',
            createdAt: notification.createdAt
        });

        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get upcoming appointments for dashboard
// @route   GET /api/appointments/upcoming/:userId
// @access  Private
const getUpcomingAppointments = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filter = {
            date: { $gte: today },
            status: { $nin: ['cancelled', 'completed'] }
        };

        if (req.user.role === 'patient') {
            filter.patientId = req.user.id; // Enforce IDOR protection
        } else if (req.user.role === 'admin' || req.user.role === 'doctor') {
            filter.doctorId = req.user.role === 'doctor' ? req.user.id : userId; // Doctor can only see theirs, admin can see others if requested
        }

        let appointments = await Appointment.find(filter)
            .populate('doctorId', 'name email')
            .populate('patientId', 'name email')
            .sort({ date: 1 })
            .limit(3)
            .lean();

        appointments = checkAndUpdateStatus(appointments);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    getUpcomingAppointments
};
