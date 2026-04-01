const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');
        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        for (const user of users) {
            const isMatch = await user.comparePassword('password');
            console.log(`- ${user.email} (${user.role}): password match 'password'? ${isMatch}`);
        }
        process.exit();
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkUsers();
