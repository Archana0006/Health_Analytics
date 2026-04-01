const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { reminderValidationRules, validate } = require('../middleware/validationMiddleware');
const { getReminders, createReminder, deleteReminder } = require('../controllers/reminderController');

router.get('/', auth, getReminders);
router.post('/', auth, reminderValidationRules(), validate, createReminder);
router.delete('/:id', auth, deleteReminder);

module.exports = router;
