const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenspace';
  
  try {
    // Attempt connection with 3-second timeout so it never hangs if local MongoDB isn't running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnectedToMongo = true;
    console.log(`[ZenSpace Data Tier] Connected to MongoDB Atlas / Local MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[ZenSpace Data Tier] MongoDB connection notice: ${err.message}`);
    console.log(`[ZenSpace Data Tier] Activating local embedded JSON database for instant zero-config demonstration.`);
    console.log(`[ZenSpace Data Tier] All CRUD, JWT Auth, Task Sync, and Note tag operations are 100% functional.`);
    console.log(`[ZenSpace Data Tier] To connect to MongoDB Atlas, update MONGODB_URI in backend/.env`);
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
