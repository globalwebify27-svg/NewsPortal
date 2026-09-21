// =============================================================================
// auth.controller.test.ts — Auth controller unit tests
// =============================================================================
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
  },
}));

jest.mock("../config/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("../utils/email.utils", () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("../utils/otp.utils", () => ({
  generateOTP: jest.fn().mockReturnValue("123456"),
  storeOTP: jest.fn().mockResolvedValue(true),
  verifyOTP: jest.fn().mockResolvedValue(true),
}));

const { login, register } = require("../controllers/auth.controller");
const { prisma } = require("../config/database");

function buildReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    headers: {},
    cookies: {},
    ip: "127.0.0.1",
    ...overrides,
  } as unknown as Request;
}

function buildRes() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

const mockNext: NextFunction = jest.fn();

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should throw error for non-existent user", async () => {
      const req = buildReq({
        body: { email: "notfound@example.com", password: "Password123!" },
      });
      const res = buildRes();

      prisma.user.findUnique.mockResolvedValue(null);

      await login(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Invalid email or password.",
        })
      );
    });

    it("should throw error for incorrect password", async () => {
      const req = buildReq({
        body: { email: "user@example.com", password: "WrongPassword123!" },
      });
      const res = buildRes();

      const hashedPassword = await bcrypt.hash("CorrectPassword123!", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        password: hashedPassword,
        isActive: true,
        role: "READER",
      });

      await login(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Invalid email or password.",
        })
      );
    });

    it("should return tokens and set cookies on successful login", async () => {
      const password = "ValidPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      const userObj = {
        id: "user-valid-1",
        email: "valid@example.com",
        name: "Test User",
        password: hashedPassword,
        isActive: true,
        role: "ADMIN",
      };

      const req = buildReq({
        body: { email: "valid@example.com", password },
      });
      const res = buildRes();

      prisma.user.findUnique.mockResolvedValue(userObj);
      prisma.user.update.mockResolvedValue(userObj);
      prisma.session.create.mockResolvedValue({ id: "session-1" });

      await login(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalledWith("accessToken", expect.any(String), expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", expect.any(String), expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        })
      );
    });
  });

  describe("register", () => {
    it("should throw conflict error if email is already taken", async () => {
      const req = buildReq({
        body: {
          name: "Existing User",
          email: "exist@example.com",
          password: "Password123!",
        },
      });
      const res = buildRes();

      prisma.user.findUnique.mockResolvedValue({ id: "existing-id" });

      await register(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
        })
      );
    });
  });
});
