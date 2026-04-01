const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    res.status(422).json({
        errors: extractedErrors,
    });
};

const mongoIdValidationRules = (paramName = 'id') => {
    return [
        paramName === 'id'
            ? param('id').isMongoId().withMessage('Invalid ID format')
            : body(paramName).isMongoId().withMessage(`Invalid ${paramName} format`)
    ];
};

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Enter a valid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('role').optional().isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
    ];
};

const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Enter a valid email address'),
        body('password').notEmpty().withMessage('Password is required'),
    ];
};

const recordValidationRules = () => {
    return [
        body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
        body('patientId').notEmpty().isMongoId().withMessage('Invalid Patient ID format'),
        body('sugarLevel').optional({ values: 'falsy' }).isNumeric().withMessage('Sugar level must be numeric'),
        body('weight').optional({ values: 'falsy' }).isNumeric().withMessage('Weight must be numeric'),
        body('height').optional({ values: 'falsy' }).isNumeric().withMessage('Height must be numeric'),
        body('temperature').optional({ values: 'falsy' }).isNumeric().withMessage('Temperature must be numeric'),
    ];
};

const appointmentValidationRules = () => {
    return [
        body('patientId').notEmpty().isMongoId().withMessage('Invalid Patient ID format'),
        body('doctorId').notEmpty().isMongoId().withMessage('Invalid Doctor ID format'),
        body('date').isISO8601().withMessage('Invalid date format'),
        body('time').notEmpty().withMessage('Time is required'),
    ];
};

const patientValidationRules = () => {
    return [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('age').optional({ checkFalsy: true }).isNumeric().withMessage('Invalid age format'),
        body('gender').optional({ checkFalsy: true }).isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
        body('phoneNumber').optional({ checkFalsy: true }).notEmpty().withMessage('Phone number is required'),
    ];
};

const labTestValidationRules = () => {
    return [
        body('patientId').notEmpty().isMongoId().withMessage('Invalid Patient ID format'),
        body('doctorId').notEmpty().isMongoId().withMessage('Invalid Doctor ID format'),
        body('testName').notEmpty().withMessage('Test name is required'),
        body('status').optional().isIn(['ordered', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    ];
};

const prescriptionValidationRules = () => {
    return [
        body('patientId').notEmpty().isMongoId().withMessage('Invalid Patient ID format'),
        body('doctorId').notEmpty().isMongoId().withMessage('Invalid Doctor ID format'),
        body('medicationName').notEmpty().withMessage('Medication name is required'),
        body('dosage').notEmpty().withMessage('Dosage is required'),
        body('frequency').notEmpty().withMessage('Frequency is required'),
        body('durationDays').optional().isNumeric().withMessage('Duration must be numeric'),
    ];
};

const reminderValidationRules = () => {
    return [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('time').notEmpty().withMessage('Time is required'),
        body('type').isIn(['medicine', 'follow-up']).withMessage('Invalid type'),
    ];
};

const doctorManagementValidationRules = () => {
    return [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').if(body('id').not().exists()).isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ];
};

const profileUpdateValidationRules = () => {
    return [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('age').optional().isNumeric().withMessage('Age must be numeric'),
        body('phoneNumber').optional().isLength({ min: 10 }).withMessage('Invalid phone number'),
    ];
};

const passwordUpdateValidationRules = () => {
    return [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    ];
};

const documentUploadValidationRules = () => {
    return [
        body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    ];
};

module.exports = {
    validate,
    userValidationRules,
    loginValidationRules,
    recordValidationRules,
    appointmentValidationRules,
    patientValidationRules,
    labTestValidationRules,
    prescriptionValidationRules,
    reminderValidationRules,
    doctorManagementValidationRules,
    profileUpdateValidationRules,
    passwordUpdateValidationRules,
    documentUploadValidationRules,
    mongoIdValidationRules,
};
