const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Event = require('../backend/src/models/Event');
const User = require('../backend/src/models/User');

const purgeBotEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const bot = await User.findOne({ email: 'bot@opporhub.com' });
        if (!bot) {
            console.log('No bot found. Nothing to purge.');
            process.exit(0);
        }

        const result = await Event.deleteMany({ organizerId: bot._id });
        console.log(`Deleted ${result.deletedCount} bot-generated events.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

purgeBotEvents();
