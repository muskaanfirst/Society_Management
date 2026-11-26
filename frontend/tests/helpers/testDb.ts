// Shared test-fixture helper for Tier 2 (vitest) and Tier 3 (Playwright).
//
// Every row these tests create is synthetic and clearly marked so it can
// never collide with, or be mistaken for, real seeded demo data:
//   - test users:  id/email prefixed "test-" / "test."
//   - test slots:  venue prefixed "TEST-", dated far in the future
// Cleanup deletes by those markers (not by specific ids), so it's safe to
// re-run even after a crashed prior run left rows behind.
import path from "node:path";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { parseEnvFile } from "./env";

export const TEST_PASSWORD = "TestPass#2026";
export const TEST_PASSWORD_HASH = bcrypt.hashSync(TEST_PASSWORD, 10);

function loadEnvLocal() {
  if (process.env.DATABASE_URL) return;
  const parsed = parseEnvFile(path.join(process.cwd(), ".env.local"));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) process.env[key] = value;
  }
}

let pool: Pool | null = null;
export function getPool(): Pool {
  if (!pool) {
    loadEnvLocal();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set (checked env and frontend/.env.local).");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function createTestStudent(id: string, email: string, rollNo: string) {
  await getPool().query(
    `INSERT INTO users (id, full_name, email, password_hash, role, roll_no, avatar_color)
     VALUES ($1, 'Test Student', $2, $3, 'student', $4, 'mint')
     ON CONFLICT (id) DO UPDATE SET email = $2, password_hash = $3, roll_no = $4`,
    [id, email, TEST_PASSWORD_HASH, rollNo]
  );
}

// Creates (or resets, if left over from a crashed prior run) an always-available
// synthetic slot and returns its id.
export async function createTestSlot(venue: string, date: string, time: string): Promise<number> {
  const result = await getPool().query(
    `INSERT INTO slot_bookings (slot_date, slot_time, venue)
     VALUES ($1, $2, $3)
     ON CONFLICT (slot_date, slot_time, venue)
     DO UPDATE SET application_id = NULL, booked_at = NULL
     RETURNING id`,
    [date, time, venue]
  );
  return result.rows[0].id;
}

export async function createTestApplication(
  studentId: string,
  societyId: string,
  status: "Pending" | "Assessed" | "Shortlisted" | "Interview_Booked" | "Rejected" = "Pending"
): Promise<number> {
  const result = await getPool().query(
    `INSERT INTO applications (student_id, society_id, status, submitted_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (student_id, society_id) DO UPDATE SET status = $3
     RETURNING id`,
    [studentId, societyId, status]
  );
  return result.rows[0].id;
}

// Deletes every row any test run has ever created, identified purely by the
// "test-"/"TEST-" marker convention above -- safe to call multiple times.
export async function cleanupAllTestData() {
  const client = getPool();
  await client.query(
    `UPDATE slot_bookings SET application_id = NULL, booked_at = NULL
     WHERE application_id IN (SELECT id FROM applications WHERE student_id LIKE 'test-%')`
  );
  await client.query(`DELETE FROM applications WHERE student_id LIKE 'test-%'`);
  await client.query(`DELETE FROM student_profiles WHERE student_id LIKE 'test-%'`);
  await client.query(`DELETE FROM compatibility_scores WHERE student_id LIKE 'test-%'`);
  await client.query(`DELETE FROM event_registrations WHERE student_id LIKE 'test-%'`);
  await client.query(`DELETE FROM slot_bookings WHERE venue LIKE 'TEST-%'`);
  await client.query(`DELETE FROM users WHERE id LIKE 'test-%'`);
}
