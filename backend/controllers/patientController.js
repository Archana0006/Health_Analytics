const { User, Patient } = require('../models');
const { resolvePatientId } = require('../utils/healthUtils');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Staff only)
const getAllPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const filter = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { hospitalPatientId: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const patients = await Patient.find(filter)
            .populate('medicalHistory', 'date diagnosis')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json(patients);
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (Staff only)
const getPatientById = async (req, res, next) => {
    try {
        let patient = await resolvePatientId(req.params.id, req.user);

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        // Authorization check
        const isOwner = req.user.id === patient.userId?.toString() || req.user.email === patient.email;
        const isStaff = req.user.role === 'admin' || req.user.role === 'doctor';
        
        if (!isOwner && !isStaff) {
            res.status(403);
            throw new Error('Access denied to this patient profile');
        }

        await patient.populate('medicalHistory');
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private (Admin only)
const createPatient = async (req, res, next) => {
    try {
        const { name, email, password, age, dob, gender, phoneNumber, address, allergies, heightCm, weightKg, systolic, diastolic, heartRate, temperatureC } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = new User({
            name,
            email,
            password,
            role: 'patient',
            age: age || undefined,
            gender: gender || undefined,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined
        });
        await user.save();

        // Generate a random hospital patient ID (e.g., PT-123456)
        const hospitalPatientId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;

        const patient = new Patient({
            hospitalPatientId,
            name,
            dob: dob || undefined,
            gender: gender || undefined,
            address: address || undefined,
            phoneNumber: phoneNumber || undefined,
            email,
            allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
            vitals: {
                heightCm,
                weightKg,
                bloodPressure: { systolic, diastolic },
                heartRate,
                temperatureC
            }
        });

        await patient.save();
        res.status(201).json({
            message: 'Patient created successfully',
            patient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private (Admin only)

// Whitelist of fields a patient record may have updated.
// Fields like email, hospitalPatientId, and createdAt are deliberately excluded
// to prevent mass assignment attacks.
const PATIENT_ALLOWED_UPDATE_FIELDS = [
    'name', 'phone', 'address', 'dob', 'gender',
    'allergies', 'phoneNumber',
    'vitals.heightCm', 'vitals.weightKg',
    'vitals.bloodPressure.systolic', 'vitals.bloodPressure.diastolic',
    'vitals.heartRate', 'vitals.temperatureC'
];

const updatePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        // Build a filtered update object — only whitelisted keys are applied
        const filteredUpdate = {};
        PATIENT_ALLOWED_UPDATE_FIELDS.forEach(field => {
            // Support dot-notation fields (e.g. 'vitals.heightCm')
            const keys = field.split('.');
            if (keys.length === 1 && req.body[field] !== undefined) {
                filteredUpdate[field] = req.body[field];
            } else if (keys.length === 2) {
                const [parent, child] = keys;
                if (req.body[parent]?.[child] !== undefined) {
                    filteredUpdate[`${parent}.${child}`] = req.body[parent][child];
                }
            } else if (keys.length === 3) {
                const [p1, p2, p3] = keys;
                if (req.body[p1]?.[p2]?.[p3] !== undefined) {
                    filteredUpdate[`${p1}.${p2}.${p3}`] = req.body[p1][p2][p3];
                }
            }
        });

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: filteredUpdate },
            { new: true, runValidators: true }
        );

        res.json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        // Also delete the associated user if email matches
        if (patient.email) {
            await User.findOneAndDelete({ email: patient.email, role: 'patient' });
        }

        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};
