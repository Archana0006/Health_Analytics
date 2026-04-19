const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Patient } = require('../models');
const sendEmail = require('../utils/sendEmail');

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

// @desc    Forgot password — send reset link via email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always respond generically to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate raw token and its hash
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f1117; border-radius: 16px; color: #e2e8f0;">
                <div style="text-align:center; margin-bottom: 24px;">
                    <h2 style="color:#6c63ff; margin:0;">HealthAI Analytics</h2>
                    <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Password Reset Request</p>
                </div>
                <p style="font-size:15px;">Hi <strong>${user.name}</strong>,</p>
                <p style="font-size:14px; color:#94a3b8;">We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>15 minutes</strong>.</p>
                <div style="text-align:center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background: linear-gradient(135deg,#6c63ff,#a855f7); color:white; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px; display:inline-block;">
                        Reset My Password
                    </a>
                </div>
                <p style="font-size:12px; color:#64748b; text-align:center;">If you didn't request this, you can safely ignore this email.<br/>Your password will not change.</p>
            </div>
        `;

        // Attempt to send email; handle failure gracefully
        try {
            await sendEmail({ to: user.email, subject: 'Reset your HealthAI password', html });
        } catch (emailError) {
            console.error('⚠️  Email delivery failed:', emailError.message);
            // In development, log the reset link so you can still test
            if (process.env.NODE_ENV !== 'production') {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🔗 DEV MODE — Password Reset Link:');
                console.log(resetUrl);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
            // Don't throw — still return success to prevent email enumeration
        }

        res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password using token
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            res.status(400);
            throw new Error('Password must be at least 6 characters.');
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400);
            throw new Error('Reset link is invalid or has expired. Please request a new one.');
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, authUser, forgotPassword, resetPassword };
