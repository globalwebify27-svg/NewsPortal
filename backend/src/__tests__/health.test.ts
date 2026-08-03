import request from "supertest";
import { app } from "../app";

describe("GET /health", () => {
  it("should return HTTP 200 with OK status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("service", "Global Awaaz CMS API");
  });
});
