// app/lib/db.ts
import pg from "pg";

const globalForDb = globalThis as unknown as { _pgPool?: pg.Pool };

const hasConnectionString = Boolean(process.env.DATABASE_URL);
const databaseKeys = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"] as const;

if (!hasConnectionString) {
  for (const key of databaseKeys) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key} or DATABASE_URL`);
    }
  }

  const dbPort = Number(process.env.DB_PORT);
  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error("DB_PORT must be a valid positive integer");
  }
}

const db =
  globalForDb._pgPool ??
  new pg.Pool(
    hasConnectionString
      ? { connectionString: process.env.DATABASE_URL }
      : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: Number(process.env.DB_PORT),
        },
  );

globalForDb._pgPool = db;

export default db;