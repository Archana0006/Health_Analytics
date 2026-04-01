const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -failedAttempts -lockUntil -__v');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.age = req.body.age || user.age;
            user.gender = req.body.gender || user.gender;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;

            const updatedUser = await user.save();
            res.json({
                message: 'Profile updated successfully',
                user: {
                    name: updatedUser.name,
                    age: updatedUser.age,
                    gender: updatedUser.gender,
                    phoneNumber: updatedUser.phoneNumber,
                    address: updatedUser.address
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400);
            throw new Error('Invalid current password');
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updatePassword
};
