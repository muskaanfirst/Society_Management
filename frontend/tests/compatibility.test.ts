import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cleanupAllTestData, closePool, createTestStudent } from "./helpers/testDb";

const BASE = "http://localhost:3000/api";
const STUDENT_ID = "test-student-compat";

const FEATURE_VECTOR = {
  coding: 0.9,
  hardware: 0.2,
  design: 0.1,
  writing: 0.1,
  speaking: 0.15,
  acting: 0.05,
  impact: 0.1,
  startups: 0.2,
};

beforeAll(async () => {
  await createTestStudent(STUDENT_ID, "test.compat@thapar.edu", "TEST000002");
});

afterAll(async () => {
  await cleanupAllTestData();
  await closePool();
});

describe("POST /api/calculate-compatibility", () => {
  it("returns a sorted compatibility score for every society", async () => {
    const res = await fetch(`${BASE}/calculate-compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: STUDENT_ID, featureVector: FEATURE_VECTOR }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scores.length).toBe(8);
    for (let i = 1; i < body.scores.length; i++) {
      expect(body.scores[i - 1].compatibilityScore).toBeGreaterThanOrEqual(
        body.scores[i].compatibilityScore
      );
    }
  });
});
