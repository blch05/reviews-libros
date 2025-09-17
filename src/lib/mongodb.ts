import { MongoClient } from 'mongodb'

console.log('🔌 MongoDB configuration loaded:', {
  uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
  db: process.env.MONGODB_DB
});

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para preservar el valor
  // durante hot reloads de módulos
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('🔄 Creating new MongoDB client...');
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('✅ MongoDB connected successfully in development');
        return client;
      })
      .catch((error) => {
        console.error('💥 MongoDB connection failed:', error);
        throw error;
      });
  } else {
    console.log('♻️ Reusing existing MongoDB connection');
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  console.log('🔄 Creating MongoDB client for production...');
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise