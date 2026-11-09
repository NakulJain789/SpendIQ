const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    if (uri) {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      // Try connecting with a 1.5-second server selection timeout
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 1500,
      });
      console.log('✅ [DB] Connected successfully to MongoDB via MONGO_URI');
      return;
    }
  } catch (err) {
    console.warn(`⚠️ [DB] Connection to MONGO_URI failed (${err.message}).`);
  }

  // Fallback to MongoMemoryServer for zero-friction local run/development if MONGO_URI is unreachable
  try {
    console.log('ℹ️ [DB] Launching embedded MongoDB memory server for development fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const fallbackUri = memoryServer.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`✅ [DB] Connected successfully to embedded MongoDB instance at: ${fallbackUri}`);
  } catch (memErr) {
    console.error('❌ [DB] Failed to initialize embedded MongoDB:', memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('[DB] Database disconnected.');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err);
  }
};

module.exports = { connectDB, disconnectDB };
