import { Pool, types } from "pg";

// Postgres DATE columns (event_date, slot_date) default-parse into JS Date
// objects, which JSON.stringify as a full ISO timestamp and break the UI's
// `new Date(dateString + "T00:00:00")` parsing. Keep them as plain
// 'YYYY-MM-DD' strings instead -- OID 1082 is `date`.
types.setTypeParser(1082, (val) => val);

// Next.js dev hot-reload re-evaluates this module on every edit; without this
// cache each reload would open a fresh Pool and leak connections. Production
// (one process, no hot-reload) just gets a single Pool for the process lifetime.
declare global {
  var _socmagPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to frontend/.env.local.");
  }
  return new Pool({
    connectionString,
    // Neon/Supabase terminate TLS with a cert not in Node's default trust
    // store; this matches their own connection docs.
    ssl: { rejectUnauthorized: false },
  });
}

function getPool(): Pool {
  if (!globalThis._socmagPool) {
    globalThis._socmagPool = createPool();
  }
  return globalThis._socmagPool;
}

// Only `query` and `connect` are used anywhere in app/api/. Delegating just
// these two (bound to the real Pool instance, created lazily on first call)
// means importing this module never touches DATABASE_URL. Without that,
// `next build` fails just from collecting route config, since every route
// file imports this module even though none of them run at build time.
const pool = {
  query: (...args: Parameters<Pool["query"]>) => getPool().query(...args),
  connect: (...args: Parameters<Pool["connect"]>) => getPool().connect(...args),
};

export default pool as unknown as Pool;
