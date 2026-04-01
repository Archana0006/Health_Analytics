const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, authUser } = require('../controllers/authController');
const { userValidationRules, loginValidationRules, validate } = require('../middleware/validationMiddleware');

// Strict login-specific rate limiter: 5 attempts per minute per IP
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts. Please try again later.'
    },
    statusCode: 429,
});

router.post('/register', userValidationRules(), validate, registerUser);
router.post('/login', loginLimiter, loginValidationRules(), validate, authUser);

module.exports = router;
