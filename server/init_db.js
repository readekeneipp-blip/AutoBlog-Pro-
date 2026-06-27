const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
async function initDb() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  try {
    await client.connect();
    console.log('Connected to Neon Postgres');
    
    // Enable uuid-ossp extension for gen_random_uuid() if not already available
    // Actually gen_random_uuid() is built-in in PG 13+
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        cms JSONB DEFAULT '{"wordpress": null, "ghost": null, "webflow": null}'::jsonb,
        subscription TEXT DEFAULT 'free'
      );
    `);
    console.log('Users table ready');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Sites table ready');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id BIGINT PRIMARY KEY,
        user_id BIGINT REFERENCES users(id),
        site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
        title TEXT,
        content TEXT,
        scheduled_time TIMESTAMPTZ,
        type TEXT,
        status TEXT DEFAULT 'pending'
      );
    `);
    console.log('Schedules table ready');

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
  }
}
initDb();
