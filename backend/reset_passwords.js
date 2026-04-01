const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';

async function resetPasswords() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const emails = ['admin@demo.com', 'doctor@demo.com', 'patient@demo.com', 'patient@gmail.com'];
        const newPassword = 'password';

        for (const email of emails) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                user.password = newPassword;
                await user.save();
                console.log(`Password reset for ${email}`);
            } else {
                console.log(`User ${email} not found`);
            }
        }

        console.log('Password reset successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetPasswords();
