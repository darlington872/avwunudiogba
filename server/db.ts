import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Use the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set. Database connections will fail.");
}

// CockroachDB configuration
export const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: true, // Use SSL for CockroachDB
  }
});

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Log successful connection
pool.on('connect', () => {
  console.log('Connected to database successfully');
});

export const db = drizzle(pool, { schema });
