const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Event = require('../backend/src/models/Event');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const count = await Event.countDocuments();
        console.log(`Total Events: ${count}`);
        
        const openSource = await Event.find({ type: 'Open Source' });
        console.log(`Open Source Items: ${openSource.length}`);
        if (openSource.length > 0) {
            console.log('First Item Tags:', openSource[0].tags);
        }

        const matches = await Event.find({ 
            $or: [
                { title: /good first issue/i },
                { description: /good first issue/i },
                { tags: /good first issue/i }
            ]
        });
        console.log(`Matches for "good first issue": ${matches.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
