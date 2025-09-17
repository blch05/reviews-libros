import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔌 Mongoose configuration loaded:', {
  uri: MONGODB_URI ? 'URI is set' : 'URI is missing',
  db: process.env.MONGODB_DB
});

// Only throw error during runtime, not during build
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ MONGODB_URI not defined. Some functionality may be limited.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    console.log('♻️ Reusing existing Mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new Mongoose connection...');
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Mongoose connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('💥 Mongoose connection failed:', error);
        cached.promise = null;
        throw error;
      });
  } else {
    console.log('⏳ Waiting for existing Mongoose connection...');
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
