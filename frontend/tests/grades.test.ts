import { describe, expect, it } from "vitest";

const BASE = "http://localhost:3000/api";

describe("GET /api/grades", () => {
  it("returns TECH grading rows", async () => {
    const res = await fetch(`${BASE}/grades?type=TECH`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.rows)).toBe(true);
  });

  it("returns NON_TECH grading rows", async () => {
    const res = await fetch(`${BASE}/grades?type=NON_TECH`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.rows)).toBe(true);
  });

  it("rejects an invalid type with 400", async () => {
    const res = await fetch(`${BASE}/grades?type=BOGUS`);
    expect(res.status).toBe(400);
  });
});
