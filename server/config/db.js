const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Uses the MONGO_URI from environment variables
 * Returns true if connected, false if failed
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
