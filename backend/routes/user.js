const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { profileUpdateValidationRules, passwordUpdateValidationRules, validate } = require('../middleware/validationMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    updatePassword
} = require('../controllers/userController');

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, profileUpdateValidationRules(), validate, updateUserProfile);
router.put('/password', auth, passwordUpdateValidationRules(), validate, updatePassword);

module.exports = router;
