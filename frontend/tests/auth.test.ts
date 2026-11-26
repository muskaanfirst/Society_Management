import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TEST_PASSWORD, cleanupAllTestData, closePool, createTestStudent } from "./helpers/testDb";

const BASE = "http://localhost:3000/api";
const STUDENT_ID = "test-student-auth";
const EMAIL = "test.auth@thapar.edu";

beforeAll(async () => {
  await createTestStudent(STUDENT_ID, EMAIL, "TEST000001");
});

afterAll(async () => {
  await cleanupAllTestData();
  await closePool();
});

describe("POST /api/auth/login", () => {
  it("logs in with a valid @thapar.edu email and correct password", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: TEST_PASSWORD }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(EMAIL);
    expect(body.role).toBe("student");
  });

  it("rejects a non-@thapar.edu email with 400", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test.auth@gmail.com", password: TEST_PASSWORD }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects the correct email with the wrong password with 401", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: "WrongPassword#1" }),
    });
    expect(res.status).toBe(401);
  });
});
