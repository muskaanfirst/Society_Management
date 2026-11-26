import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupAllTestData,
  closePool,
  createTestApplication,
  createTestStudent,
} from "./helpers/testDb";

const BASE = "http://localhost:3000/api";
const STUDENT_ID = "test-student-submit";
let applicationId: number;

beforeAll(async () => {
  await createTestStudent(STUDENT_ID, "test.submit@thapar.edu", "TEST000004");
  applicationId = await createTestApplication(STUDENT_ID, "soc-ccs", "Pending"); // soc-ccs is TECH
});

afterAll(async () => {
  await cleanupAllTestData();
  await closePool();
});

describe("POST /api/test-submit", () => {
  it("grades a submission and returns a real computed score", async () => {
    const res = await fetch(`${BASE}/test-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        answers: [{ questionId: "q1", selectedIndex: 1 }],
        tabSwitchCount: 2,
        focusLossDuration: 5,
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.score).toBe("number");
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
  });

  it("rejects a request missing applicationId with 400", async () => {
    const res = await fetch(`${BASE}/test-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [] }),
    });
    expect(res.status).toBe(400);
  });
});
