import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupAllTestData,
  closePool,
  createTestApplication,
  createTestSlot,
  createTestStudent,
} from "./helpers/testDb";

const BASE = "http://localhost:3000/api";
const STUDENT_ID = "test-student-slots";
let applicationId: number;
let slotId: number;

beforeAll(async () => {
  await createTestStudent(STUDENT_ID, "test.slots@thapar.edu", "TEST000003");
  applicationId = await createTestApplication(STUDENT_ID, "soc-ccs", "Shortlisted");
  slotId = await createTestSlot("TEST-SLOT-VITEST", "2099-06-01", "10:00:00");
});

afterAll(async () => {
  await cleanupAllTestData();
  await closePool();
});

describe("POST /api/slots/book", () => {
  it("books an available slot", async () => {
    const res = await fetch(`${BASE}/slots/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, applicationId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slot.status).toBe("booked");
  });

  it("rejects a second booking attempt on the same slot with 409 (atomic double-booking guard)", async () => {
    const res = await fetch(`${BASE}/slots/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, applicationId }),
    });
    expect(res.status).toBe(409);
  });
});
