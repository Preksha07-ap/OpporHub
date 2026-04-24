const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Event = require('../backend/src/models/Event');

const seedDemographics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const events = await Event.find({});
        console.log(`Updating ${events.length} events with demographic seeds.`);

        for (const ev of events) {
            if (!ev.engagement) {
                ev.engagement = {
                    views: Math.floor(Math.random() * 100) + 50,
                    clicks: Math.floor(Math.random() * 20) + 5,
                    baseInterest: Math.floor(Math.random() * 50) + 15
                };
            }
            
            // Seed demographics
            ev.engagement.demographics = {
                year1: Math.floor(Math.random() * 10),
                year2: Math.floor(Math.random() * 10),
                year3: Math.floor(Math.random() * 10),
                year4: Math.floor(Math.random() * 10),
                topYearSeed: Math.floor(Math.random() * 4) + 1
            };
            
            // For variety, let's make some explicitly popular among 2nd years
            if (Math.random() > 0.7) {
                ev.engagement.demographics.topYearSeed = 2;
                ev.engagement.demographics.year2 = 50; 
            }

            ev.markModified('engagement');
            await ev.save();
        }

        console.log('Successfully seeded demographics for all events.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDemographics();
