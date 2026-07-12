import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("GET /health", () => {
  it("returns ok when database is reachable", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /", () => {
  it("returns welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Willkommen");
  });
});
