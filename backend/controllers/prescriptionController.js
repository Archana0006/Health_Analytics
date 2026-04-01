const { Prescription, Patient } = require('../models');
const { resolvePatientId } = require('../utils/healthUtils');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor/Admin)
const createPrescription = async (req, res, next) => {
    try {
        const { patientId, medicationName, dosage, frequency, durationDays, route, instructions, startDate, endDate } = req.body;

        const patient = await resolvePatientId(patientId, req.user);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        const prescription = new Prescription({
            patientId: patient._id,
            doctorId: req.user.id,
            medicationName,
            dosage,
            frequency,
            durationDays,
            route,
            instructions,
            startDate,
            endDate
        });

        await prescription.save();
        res.status(201).json(prescription);
    } catch (error) {
        next(error);
    }
};

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
const getPatientPrescriptions = async (req, res, next) => {
    try {
        const patient = await resolvePatientId(req.params.patientId, req.user);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (req.user.role === 'patient' && patient.userId && patient.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const prescriptions = await Prescription.find({ patientId: patient._id })
            .populate('doctorId', 'name email')
            .sort({ createdAt: -1 });

        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor/Admin)
const updatePrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        if (req.user.role === 'patient') {
            return res.status(403).json({ message: 'Not authorized to edit prescriptions' });
        }

        const updatedPrescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedPrescription);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor/Admin)
const deletePrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        if (req.user.role === 'patient') {
            return res.status(403).json({ message: 'Not authorized to delete prescriptions' });
        }

        await Prescription.findByIdAndDelete(req.params.id);
        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPrescription,
    getPatientPrescriptions,
    updatePrescription,
    deletePrescription
};
