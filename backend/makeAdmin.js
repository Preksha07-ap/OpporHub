const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // REPLACE THE EMAIL BELOW WITH YOUR ACTUAL LOGIN EMAIL
        const emailToFind = 'your_email@example.com'; 
        
        const user = await User.findOne({ email: emailToFind });

        if (!user) {
            console.log(`User with email ${emailToFind} not found!`);
            process.exit(1);
        }

        user.role = 'ADMIN';
        await user.save();

        console.log(`Success! User ${user.name} is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

makeAdmin();
