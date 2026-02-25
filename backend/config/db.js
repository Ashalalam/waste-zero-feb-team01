const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // increase timeout
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 5,
    });

    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.log("Running in demo mode without database.");
  }
};

module.exports = connectDB;