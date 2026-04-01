const { LabTest, LabResult, Patient } = require('../models');
const { resolvePatientId } = require('../utils/healthUtils');

// @desc    Order a new lab test
// @route   POST /api/labs/tests
// @access  Private (Doctor/Admin)
const orderTest = async (req, res, next) => {
    try {
        const { patientId, testName, testCode } = req.body;

        const patient = await resolvePatientId(patientId, req.user);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        const labTest = new LabTest({
            patientId: patient._id,
            doctorId: req.user.id,
            testName,
            testCode,
            status: 'ordered'
        });

        await labTest.save();
        res.status(201).json(labTest);
    } catch (error) {
        next(error);
    }
};

// @desc    Get tests for a patient
// @route   GET /api/labs/tests/patient/:patientId
// @access  Private
const getPatientTests = async (req, res, next) => {
    try {
        const patient = await resolvePatientId(req.params.patientId, req.user);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (req.user.role === 'patient' && patient.userId && patient.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const tests = await LabTest.find({ patientId: patient._id })
            .populate('doctorId', 'name')
            .populate('resultId')
            .sort({ orderedAt: -1 });

        res.json(tests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tests
// @route   GET /api/labs/tests
// @access  Private (Admin/LabTech)
const getAllTests = async (req, res, next) => {
    try {
        const tests = await LabTest.find()
            .populate('patientId', 'name hospitalPatientId email')
            .populate('doctorId', 'name')
            .populate('resultId')
            .sort({ orderedAt: -1 });
        res.json(tests);
    } catch (error) {
        next(error);
    }
};

// @desc    Upload or Verify lab result
// @route   POST /api/labs/results
// @access  Private (Admin/LabTech)
const uploadResult = async (req, res, next) => {
    try {
        const { labTestId, resultData, resultValues, comments } = req.body;

        const labTest = await LabTest.findById(labTestId);
        if (!labTest) {
            return res.status(404).json({ message: 'Lab Test not found' });
        }

        // Auto-flag abnormal if any value says so
        const abnormal = resultValues && resultValues.some(val => ['high', 'low', 'critical'].includes(val.flag));

        const labResult = new LabResult({
            labTestId,
            patientId: labTest.patientId,
            doctorId: labTest.doctorId, // Doctor who ordered it
            resultData,
            resultValues,
            abnormal,
            comments
        });

        await labResult.save();

        // Link result to test and mark completed
        labTest.resultId = labResult._id;
        labTest.status = 'completed';
        await labTest.save();

        // Notify patient
        const patient = await Patient.findById(labTest.patientId);
        const Notification = require('../models/Notification');
        const notificationMsg = `Results are ready for your ${labTest.testName} test.`;
        const notification = new Notification({
            userId: patient?.userId || labTest.patientId,
            message: notificationMsg,
            type: 'alert'
        });
        await notification.save();

        // Emit real-time socket notification
        require('../utils/socket').sendNotification(patient?.userId || labTest.patientId, {
            message: notificationMsg,
            type: 'alert',
            createdAt: notification.createdAt
        });

        res.status(201).json(labResult);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    orderTest,
    getPatientTests,
    getAllTests,
    uploadResult
};
