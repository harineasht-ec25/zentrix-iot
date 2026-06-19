// lib/db.js  — shared MongoDB connection (reused across warm serverless invocations)
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME     = process.env.MONGODB_DB || 'zentrix';

if (!MONGODB_URI) {
  throw new Error('Please set the MONGODB_URI environment variable in Vercel project settings.');
}

// Reuse connection across warm Lambda invocations
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function getDb() {
  const c = await clientPromise;
  return c.db(DB_NAME);
}

async function getCollection() {
  const db = await getDb();
  return db.collection('products');
}

module.exports = { getDb, getCollection };
