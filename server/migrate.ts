
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, // Use SSL for CockroachDB
  }
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations complete!");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
