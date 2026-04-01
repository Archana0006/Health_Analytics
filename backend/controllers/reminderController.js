const Reminder = require('../models/Reminder');

// @desc    Get reminders for current user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.id }).sort({ time: 1 });
        res.json(reminders);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
    try {
        const reminder = new Reminder({ ...req.body, userId: req.user.id });
        const savedReminder = await reminder.save();
        res.status(201).json(savedReminder);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res, next) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!reminder) {
            res.status(404);
            throw new Error('Reminder not found');
        }
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReminders,
    createReminder,
    deleteReminder
};
