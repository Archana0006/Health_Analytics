const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fetchDatabaseInfo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\nCollections in Database:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);

            if (count > 0) {
                const sample = await db.collection(col.name).findOne();
                console.log(`  Sample Document:`, JSON.stringify(sample, null, 2));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fetching database info:', error);
        process.exit(1);
    }
};

fetchDatabaseInfo();
