require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

const emailToUnlock = process.argv[2] || 'patient@gmail.com';

async function unlockAccount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const result = await User.findOneAndUpdate(
            { email: emailToUnlock.toLowerCase() },
            { $set: { failedAttempts: 0, lockUntil: null } },
            { new: true }
        );

        if (!result) {
            console.log(`❌ No user found with email: ${emailToUnlock}`);
        } else {
            console.log(`✅ Account unlocked for: ${result.email} (role: ${result.role})`);
            console.log(`   Failed attempts reset to 0, lock removed.`);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

unlockAccount();
