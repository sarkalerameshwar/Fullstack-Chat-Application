import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../index.js";
import { generateToken } from "../lib/utils.js";

test("GET /api/health should return status 200 OK and system metadata", async () => {
  const response = await request(app).get("/api/health");
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.status, "OK");
  assert.ok(response.body.timestamp, "Response should include timestamp");
  assert.ok(typeof response.body.uptime === "number", "Uptime should be a number");
});

test("generateToken should set 7-day cookie maxAge", () => {
  const mockRes = {
    cookie: (name, value, options) => {
      if (name === "jwt") {
        mockRes.jwtMaxAge = options.maxAge;
      }
    }
  };
  generateToken("mockUserId123", mockRes);
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  assert.strictEqual(mockRes.jwtMaxAge, sevenDaysInMs, "JWT cookie maxAge should be 7 days");
});
