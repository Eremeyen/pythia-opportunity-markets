import mongoose from 'mongoose';

export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI.');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.info('[db] Connected to MongoDB');
  } catch (error) {
    console.error('[db] Mongo connection failed');
    throw error;
  }
};
