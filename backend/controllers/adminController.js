const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Notification = require('../models/Notification');
const Document = require('../models/Document');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalRecords = await HealthRecord.countDocuments();

        const recentAlerts = await Notification.find({ type: 'alert' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');

        res.json({
            totalUsers,
            totalPatients,
            totalDoctors,
            totalRecords,
            recentAlerts: recentAlerts.map(a => ({
                id: a._id,
                message: a.message,
                userName: a.userId ? a.userId.name : 'Unknown',
                date: a.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { next(error); }
};

// @desc    Add a new user directly
// @route   POST /api/admin/users
// @access  Private (Admin only)
const addUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase();
        
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        
        const user = new User({ name, email: normalizedEmail, password, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email: normalizedEmail, role } });
    } catch (error) { next(error); }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        if (user._id.toString() === req.user.id) {
            res.status(400);
            throw new Error('Cannot delete your own admin account');
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) { next(error); }
};

// @desc    Change a user's password
// @route   PUT /api/admin/users/:id/password
// @access  Private (Admin only)
const changeUserPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) { next(error); }
};

// @desc    Get all files in system
// @route   GET /api/admin/files
// @access  Private (Admin only)
const getAllFiles = async (req, res, next) => {
    try {
        const files = await Document.find()
            .populate('patientId', 'name email')
            .populate('uploadedBy', 'name role')
            .sort({ uploadDate: -1 });
        res.json(files);
    } catch (error) { next(error); }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    addUser,
    deleteUser,
    changeUserPassword,
    getAllFiles
};
