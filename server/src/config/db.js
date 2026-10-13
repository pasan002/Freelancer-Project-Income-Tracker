const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelancer_tracker';
  const localUri = 'mongodb://127.0.0.1:27017/freelancer_tracker';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️ Primary MongoDB Connection Failed: ${error.message}`);

    if (primaryUri.includes('mongodb+srv')) {
      console.warn(`➡️ To enable Atlas: Go to MongoDB Atlas -> Network Access -> Add IP Address -> "Allow Access From Anywhere" (0.0.0.0/0).`);
      console.log(`🔄 Attempting fallback connection to local MongoDB service...`);
      try {
        const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
        console.log(` Connected to local MongoDB fallback: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(` Local MongoDB fallback also failed: ${localError.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
