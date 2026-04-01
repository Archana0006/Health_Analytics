const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';

async function testLogin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'patient@gmail.com';
        const password = 'password';

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`User ${email} not found`);
            process.exit(1);
        }

        const isMatch = await user.comparePassword(password);
        console.log(`Login result for ${email}: ${isMatch ? 'SUCCESS' : 'FAILURE'}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testLogin();
