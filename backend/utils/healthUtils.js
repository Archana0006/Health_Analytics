const { Patient, User } = require('../models');

/**
 * Resolves a Patient document from either a Patient ID or a User ID.
 * Useful for mapping authenticated User accounts to their clinical Patient profile.
 */
const resolvePatientId = async (id, reqUser) => {
    if (!id) return null;

    // 1. Try finding by Patient ID
    let patient = await Patient.findById(id);
    if (patient) return patient;

    // 2. Try finding by User ID (passed directly or from reqUser)
    const user = await User.findById(id);
    if (user && user.role === 'patient') {
        // Try finding by userId first (more reliable)
        patient = await Patient.findOne({ userId: user._id });
        if (!patient) {
            // Fallback to email for legacy records
            patient = await Patient.findOne({ email: user.email });
        }
        
        // Auto-create clinical profile if missing
        if (!patient) {
            console.log(`Auto-creating missing clinical profile for user: ${user.email}`);
            const hospitalPatientId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
            patient = new Patient({
                hospitalPatientId,
                userId: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                dob: user.dob
            });
            await patient.save();
        } else if (!patient.userId) {
            // Update legacy patient profile with userId
            patient.userId = user._id;
            await patient.save();
        }
        return patient;
    }

    // 3. Fallback for authorized patient viewing their own (if id is their User ID)
    if (reqUser && reqUser.role === 'patient' && reqUser.id === id) {
        patient = await Patient.findOne({ userId: reqUser.id });
        
        // Auto-create clinical profile if missing (redundant but safe)
        if (!patient) {
            const user = await User.findById(reqUser.id);
            if (!user) return null;
            console.log(`Auto-creating missing clinical profile for auth user: ${user.email}`);
            const hospitalPatientId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
            patient = new Patient({
                hospitalPatientId,
                userId: reqUser.id,
                name: user.name || 'Unknown',
                email: user.email,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                dob: user.dob
            });
            await patient.save();
        } else if (!patient.userId) {
            patient.userId = reqUser.id;
            await patient.save();
        }
        return patient;
    }

    return null;
};

/**
 * Sanitizes a string for use in a MongoDB $regex query.
 * Prevents ReDoS attacks and unintended query broadness.
 */
const sanitizeRegex = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
    resolvePatientId,
    sanitizeRegex
};
