// lib/rateLimit.ts
import db from "../_lib/db";

export async function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  lockMinutes: number
) {
  const { rows } = await db.query(
    `SELECT attempts, locked_until FROM rate_limits WHERE identifier = $1`,
    [identifier]
  );
  const now = new Date();
  const entry = rows[0];

  if (entry?.locked_until && now < new Date(entry.locked_until)) {
    return { allowed: false };
  }

  const attempts = entry?.locked_until ? 1 : (entry?.attempts ?? 0) + 1;

  if (attempts > maxAttempts) {
    await db.query(
      `INSERT INTO rate_limits (identifier, attempts, locked_until)
       VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'))
       ON CONFLICT (identifier) DO UPDATE SET attempts = $2, locked_until = EXCLUDED.locked_until`,
      [identifier, attempts, lockMinutes]
    );
    return { allowed: false };
  }

  await db.query(
    `INSERT INTO rate_limits (identifier, attempts, locked_until)
     VALUES ($1, $2, NULL)
     ON CONFLICT (identifier) DO UPDATE SET attempts = $2, locked_until = NULL`,
    [identifier, attempts]
  );
  return { allowed: true };
}