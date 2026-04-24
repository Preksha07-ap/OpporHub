const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Event = require('../backend/src/models/Event');

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const events = await Event.find({ title: /Lift Aider/i });
        console.log('Found events:', JSON.stringify(events, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkEvents();
