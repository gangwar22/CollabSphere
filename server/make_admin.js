const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const makeAdmin = async (email) => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('ERROR: MONGO_URI is not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email "${email}" not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        user.isAdmin = true; // Supporting both methods just in case
        await user.save();

        console.log(`SUCCESS: User "${email}" is now an Admin.`);
        console.log(`You can now log in and access http://localhost:5173/admin`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Check if email is provided as argument
const emailArg = process.argv[2];
if (!emailArg) {
    console.log('Usage: node make_admin.js <user_email>');
    process.exit(1);
}

makeAdmin(emailArg);
