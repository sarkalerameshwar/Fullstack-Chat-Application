import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../index.js";

test("GET /api/health should return status 200 OK and system metadata", async () => {
  const response = await request(app).get("/api/health");
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.status, "OK");
  assert.ok(response.body.timestamp, "Response should include timestamp");
  assert.ok(typeof response.body.uptime === "number", "Uptime should be a number");
});
