import { describe, expect, it } from "vitest";

const BASE = "http://localhost:3000/api";

describe("GET /api/societies", () => {
  it("returns all 8 seeded societies", async () => {
    const res = await fetch(`${BASE}/societies`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.societies)).toBe(true);
    expect(body.societies.length).toBe(8);
    for (const field of ["id", "name", "type", "managerId"]) {
      expect(body.societies[0]).toHaveProperty(field);
    }
  });
});
