import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupAllTestData,
  closePool,
  createTestApplication,
  createTestStudent,
} from "./helpers/testDb";

const BASE = "http://localhost:3000/api";
const STUDENT_ID = "test-student-portfolio";
let applicationId: number;

beforeAll(async () => {
  await createTestStudent(STUDENT_ID, "test.portfolio@thapar.edu", "TEST000005");
  applicationId = await createTestApplication(STUDENT_ID, "soc-faps", "Pending"); // soc-faps is NON_TECH
});

afterAll(async () => {
  await cleanupAllTestData();
  await closePool();
});

describe("POST /api/applications/portfolio", () => {
  it("saves a valid portfolio URL", async () => {
    const res = await fetch(`${BASE}/applications/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, portfolioUrl: "https://example.com/test-portfolio" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.application.portfolioUrl).toBe("https://example.com/test-portfolio");
  });

  it("rejects an invalid URL with 400", async () => {
    const res = await fetch(`${BASE}/applications/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, portfolioUrl: "not-a-url" }),
    });
    expect(res.status).toBe(400);
  });
});
