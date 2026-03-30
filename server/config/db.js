const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`Connecting to: ${process.env.MONGO_URI}`);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('IP that isn\'t whitelisted') || error.message.includes('ECONNREFUSED')) {
      console.error('ERROR: Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('Please go to Atlas > Network Access > Add IP Address > "Allow Access From Anywhere (0.0.0.0/0)".');
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
