// Creates the dedicated synthetic e2e fixtures (test student + two
// throwaway interview slots) once before the whole Playwright run. Uses the
// same "test-"/"TEST-" marker convention as the Tier 2 vitest fixtures
// (frontend/tests/helpers/testDb.ts) so cleanup is safe and idempotent.
import {
  createTestApplication,
  createTestSlot,
  createTestStudent,
  closePool,
} from "../tests/helpers/testDb";

export const E2E_STUDENT_ID = "test-student-e2e";
export const E2E_STUDENT_EMAIL = "test.e2e@thapar.edu";
export const E2E_TECH_SOCIETY_ID = "soc-gdg"; // TECH, not touched by Tier 2's fixtures
export const E2E_NONTECH_SOCIETY_ID = "soc-tnt"; // NON_TECH, not touched by Tier 2's fixtures

export default async function globalSetup() {
  await createTestStudent(E2E_STUDENT_ID, E2E_STUDENT_EMAIL, "TEST000099");
  // Pre-shortlisted NON_TECH application so the booking spec can go straight
  // to "book an interview" without re-testing the apply/grade flow.
  await createTestApplication(E2E_STUDENT_ID, E2E_NONTECH_SOCIETY_ID, "Shortlisted");
  await createTestSlot("TEST-SLOT-E2E-1", "2099-07-01", "10:00:00");
  await createTestSlot("TEST-SLOT-E2E-2", "2099-07-01", "11:00:00");
  await closePool();
}
