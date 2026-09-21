// =============================================================================
// auth.middleware.test.ts — JWT auth middleware tests
// =============================================================================
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mock prisma before importing middleware
jest.mock("../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Dynamic import to use mocked module
const { protect } = require("../middleware/auth.middleware");
const { prisma } = require("../config/database");

const TEST_SECRET = "test-jwt-secret";
const USER_PAYLOAD = { id: "user-123", role: "ADMIN", email: "admin@test.com", type: "access" };

function signToken(payload: object = USER_PAYLOAD, secret = TEST_SECRET) {
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function buildReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

const mockNext: NextFunction = jest.fn();

function buildRes() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

describe("auth protect middleware", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, JWT_ACCESS_SECRET: TEST_SECRET };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should forward 401 UnauthorizedError to next() if no token provided", async () => {
    const req = buildReq();
    const res = buildRes();
    await protect(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    );
  });

  it("should call next() without error on valid token and active user", async () => {
    const token = signToken();
    const req = buildReq({ headers: { authorization: `Bearer ${token}` } });
    const res = buildRes();

    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      isActive: true,
      role: "ADMIN",
    });

    await protect(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
    expect((req as any).user).toEqual(
      expect.objectContaining({ id: "user-123", role: "ADMIN" })
    );
  });

  it("should forward 401 UnauthorizedError to next() for deactivated user", async () => {
    const token = signToken();
    const req = buildReq({ headers: { authorization: `Bearer ${token}` } });
    const res = buildRes();

    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      isActive: false,
      role: "ADMIN",
    });

    await protect(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    );
  });

  it("should forward JsonWebTokenError to next() for tampered token", async () => {
    const req = buildReq({
      headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.tampered.sig" },
    });
    const res = buildRes();
    await protect(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "JsonWebTokenError",
      })
    );
  });
});
