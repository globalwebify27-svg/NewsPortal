// =============================================================================
// sanitizer.middleware.test.ts — Tests for XSS sanitization middleware
// =============================================================================
import { sanitizeInput } from "../middleware/sanitizer.middleware";
import { Request, Response, NextFunction } from "express";

function buildMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as unknown as Request;
}

const mockRes = {} as Response;
const mockNext: NextFunction = jest.fn();

describe("sanitizeInput middleware", () => {
  beforeEach(() => {
    (mockNext as jest.Mock).mockClear();
  });

  it("should call next()", () => {
    const req = buildMockReq({ body: { title: "Hello" } });
    sanitizeInput(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should strip <script> tags from plain text fields", () => {
    const req = buildMockReq({
      body: { title: 'Hello <script>alert("xss")</script> World' },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.title).not.toContain("<script>");
    expect(req.body.title).not.toContain("alert");
  });

  it("should strip onclick event handlers from plain text fields", () => {
    const req = buildMockReq({
      body: { title: '<p onclick="evil()">Click me</p>' },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.title).not.toContain("onclick");
  });

  it("should strip single-quote event handlers from plain text fields", () => {
    const req = buildMockReq({
      body: { title: "<img src=x onerror='alert(1)'>" },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.title).not.toContain("onerror");
  });

  it("should allow safe HTML in body (rich text) field", () => {
    const safeHtml = "<h2>Headline</h2><p>This is <strong>bold</strong> text.</p>";
    const req = buildMockReq({ body: { body: safeHtml } });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.body).toContain("<h2>");
    expect(req.body.body).toContain("<strong>");
  });

  it("should strip <script> from body (rich text) field too", () => {
    const req = buildMockReq({
      body: { body: '<p>Good text</p><script>evil()</script>' },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.body).not.toContain("<script>");
    expect(req.body.body).toContain("<p>Good text</p>");
  });

  it("should sanitize nested objects", () => {
    const req = buildMockReq({
      body: { user: { name: '<script>alert(1)</script>' } },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.body.user.name).not.toContain("<script>");
  });

  it("should sanitize query params", () => {
    const req = buildMockReq({
      query: { search: '<script>xss</script>' },
    });
    sanitizeInput(req, mockRes, mockNext);
    expect(req.query.search).not.toContain("<script>");
  });

  it("should handle non-string values without crashing", () => {
    const req = buildMockReq({
      body: { count: 42, active: true, data: null },
    });
    expect(() => sanitizeInput(req, mockRes, mockNext)).not.toThrow();
  });
});
