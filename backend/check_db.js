const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('./src/models/Event');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Event.countDocuments();
        const events = await Event.find().limit(5);
        console.log(`Total events in DB: ${count}`);
        console.log('Sample events:', JSON.stringify(events, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDb();
