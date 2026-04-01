const jwt = require('jsonwebtoken');
const { User, Patient } = require('../models');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase();

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = new User({ name, email, password, role });
        await user.save();

        // Automatically create a clinical Patient profile for new patient users
        if (role === 'patient') {
            const hospitalPatientId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
            const patient = new Patient({
                hospitalPatientId,
                userId: user._id, // Link to the user account
                name,
                email: normalizedEmail
            });
            await patient.save();
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        // Check if account is currently locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            res.status(423);
            throw new Error(`Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`);
        }

        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            // Reset lockout counters on successful login
            user.failedAttempts = 0;
            user.lockUntil = null;
            await user.save();

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                token,
                user: { id: user._id, name: user.name, role: user.role }
            });
        }

        // Wrong password — increment failed attempts
        user.failedAttempts = (user.failedAttempts || 0) + 1;

        if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
            await user.save();
            res.status(423);
            throw new Error('Account temporarily locked due to too many failed login attempts. Try again in 10 minute(s).');
        }

        await user.save();
        const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failedAttempts;
        res.status(401);
        throw new Error(`Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`);

    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, authUser };
