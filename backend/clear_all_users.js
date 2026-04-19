const mongoose = require('mongoose');
require('dotenv').config();

async function clearAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Show current counts
        const userCount = await db.collection('users').countDocuments();
        const patientCount = await db.collection('patients').countDocuments();
        console.log(`\n📊 Current data:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Patients: ${patientCount}`);

        // Delete all users
        const userResult = await db.collection('users').deleteMany({});
        console.log(`\n🗑️  Deleted ${userResult.deletedCount} users`);

        // Delete all patient profiles (linked to users)
        const patientResult = await db.collection('patients').deleteMany({});
        console.log(`🗑️  Deleted ${patientResult.deletedCount} patient profiles`);

        // Verify
        const remainingUsers = await db.collection('users').countDocuments();
        const remainingPatients = await db.collection('patients').countDocuments();
        console.log(`\n✅ Database cleared!`);
        console.log(`   Remaining Users: ${remainingUsers}`);
        console.log(`   Remaining Patients: ${remainingPatients}`);
        console.log(`\n🎉 You can now register fresh accounts.`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

clearAllUsers();
