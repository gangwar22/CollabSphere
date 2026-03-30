const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const users = await User.find({}, 'email isAdmin role');
        console.log('--- User List ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, isAdmin: ${u.isAdmin}, role: ${u.role}`);
        });
        console.log('-----------------');
        
        const admins = users.filter(u => u.isAdmin === true || u.role === 'admin');
        if (admins.length === 0) {
            console.log('No admins found in the database.');
        } else {
            console.log(`Found ${admins.length} admin(s).`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmin();
