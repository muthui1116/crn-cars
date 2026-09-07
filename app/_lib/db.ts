// app/lib/db.ts
import pg from "pg";

const globalForDb = globalThis as unknown as { _pgPool?: pg.Pool };

const requiredEnv = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const dbPort = Number(process.env.DB_PORT);
if (!Number.isInteger(dbPort) || dbPort <= 0) {
  throw new Error("DB_PORT must be a valid positive integer");
}

const db =
  globalForDb._pgPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

globalForDb._pgPool = db;

export default db;