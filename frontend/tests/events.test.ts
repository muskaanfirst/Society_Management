import { describe, expect, it } from "vitest";

const BASE = "http://localhost:3000/api";

describe("GET /api/events", () => {
  it("returns the seeded campus events", async () => {
    const res = await fetch(`${BASE}/events`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);
  });
});
