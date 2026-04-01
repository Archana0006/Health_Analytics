const { Patient, Appointment, User, MedicalRecord } = require('../models');
const doctorService = require('../services/doctorService');
const Notification = require('../models/Notification'); // Keep Notification if it's used elsewhere or for future expansion

// @desc    Get dashboard statistics for doctor
// @route   GET /api/doctor/stats
// @access  Private/Doctor
const getDoctorStats = async (req, res, next) => {
    try {
        const stats = await doctorService.getDoctorStats(req.user.id);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all doctors
// @route   GET /api/doctor/list
// @access  Private
const getDoctorList = async (req, res, next) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.json(doctors);
    } catch (error) {
        next(error);
    }
};

// @desc    Create/Update doctor account
// @route   POST/PUT /api/doctor/manage
// @access  Private (Admin only)
const manageDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const doctorData = { ...req.body, role: 'doctor' };

        if (id) {
            // Update
            const doctor = await User.findById(id);
            if (!doctor || doctor.role !== 'doctor') {
                res.status(404);
                throw new Error('Doctor not found');
            }
            const updatedDoctor = await User.findByIdAndUpdate(id, doctorData, { new: true }).select('-password');
            res.json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
        } else {
            // Create
            const existingUser = await User.findOne({ email: doctorData.email });
            if (existingUser) {
                res.status(400);
                throw new Error('User already exists');
            }
            const doctor = new User(doctorData);
            await doctor.save();
            res.status(201).json({ message: 'Doctor created successfully' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete doctor
// @route   DELETE /api/doctor/manage/:id
// @access  Private (Admin only)
const deleteDoctor = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.role !== 'doctor') {
            res.status(404);
            throw new Error('Doctor not found');
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get high-risk patients for a doctor
// @route   GET /api/doctor/critical-patients
// @access  Private (Doctor only)
const getCriticalPatients = async (req, res, next) => {
    try {
        const patients = await doctorService.getCriticalPatients();
        res.json(patients);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDoctorStats,
    getDoctorList,
    manageDoctor,
    deleteDoctor,
    getCriticalPatients
};
