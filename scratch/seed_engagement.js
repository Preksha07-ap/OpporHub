const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Event = require('../backend/src/models/Event');

const seedEngagement = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const events = await Event.find({ engagement: { $exists: false } });
        console.log(`Found ${events.length} events without engagement data.`);

        for (const ev of events) {
            ev.engagement = {
                views: Math.floor(Math.random() * 100) + 50,
                clicks: Math.floor(Math.random() * 20) + 5,
                baseInterest: Math.floor(Math.random() * 50) + 15
            };
            await ev.save();
        }

        console.log('Successfully seeded engagement data for all existing events.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedEngagement();
