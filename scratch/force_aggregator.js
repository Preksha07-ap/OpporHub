const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { startCronJobs } = require('../backend/src/utils/cronJobs');
const connectDB = require('../backend/src/config/db');

const forceRunAggregator = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');
        
        const { startCronJobs } = require('../backend/src/utils/cronJobs');
        // startCronJobs calls runAggregatorEngine immediately
        startCronJobs();
        
        console.log('Aggregator triggered. Wait for logs...');
        // We'll keep it running for a bit to let the async tasks finish
        setTimeout(() => {
            console.log('Finished manual trigger.');
            process.exit(0);
        }, 30000);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

forceRunAggregator();
