// =============================================================================
// Email Utility — Nodemailer SMTP + HTML Templates
// =============================================================================

import nodemailer from "nodemailer";
import { logger } from "../config/logger";

// ─── Transport ─────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Base Email Wrapper ────────────────────────────────────────────────────────
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Global Awaaz</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: #111; padding: 28px 32px; }
        .logo { font-family: Georgia, serif; font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: -0.01em; }
        .logo span { color: #e50914; }
        .body { padding: 36px 32px; color: #333; line-height: 1.6; }
        .otp-box { background: #f8f8f8; border: 2px dashed #e50914; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 2.5rem; font-weight: 900; letter-spacing: 0.3em; color: #111; }
        .btn { display: inline-block; background: #e50914; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; margin-top: 16px; }
        .footer { background: #f5f5f5; padding: 20px 32px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header"><div class="logo">GLOBAL <span>AWAAZ</span></div></div>
        <div class="body">${content}</div>
        <div class="footer">© ${new Date().getFullYear()} Global Awaaz. All rights reserved.<br>You received this email because you have an account on Global Awaaz.</div>
      </div>
    </body>
    </html>
  `;
}

// ─── Send Generic Email ───────────────────────────────────────────────────────
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Global Awaaz"}" <${process.env.EMAIL_FROM || "noreply@globalawaaz.com"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
}

// ─── OTP Verification Email ───────────────────────────────────────────────────
export async function sendOTPEmail(to: string, otp: string, name: string): Promise<void> {
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your verification code for <strong>Global Awaaz</strong> is:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="font-size:0.85rem;color:#666;margin-top:8px">This code expires in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong></p>
    </div>
    <p>If you did not request this, you can safely ignore this email.</p>
  `);
  await sendEmail({ to, subject: "Your Global Awaaz Verification Code", html });
}

// ─── Password Reset Email ─────────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  name: string
): Promise<void> {
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your Global Awaaz password. Click the button below to create a new password:</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </div>
    <p style="font-size:0.85rem;color:#666">This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>
    <p style="font-size:0.85rem;color:#999;word-break:break-all">Or copy this URL: ${resetUrl}</p>
  `);
  await sendEmail({ to, subject: "Reset Your Global Awaaz Password", html });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = baseTemplate(`
    <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#111;margin-top:0">Welcome to Global Awaaz! 🎉</h2>
    <p>Hi <strong>${name}</strong>, your account is now active.</p>
    <p>You now have access to:</p>
    <ul style="padding-left:20px;line-height:2">
      <li>📰 Breaking news & in-depth analysis</li>
      <li>🔖 Save articles with Bookmarks</li>
      <li>💬 Join the conversation in comments</li>
      <li>🔔 Follow your favourite authors</li>
      <li>📧 Personalised newsletter</li>
    </ul>
    <div style="text-align:center;margin-top:28px">
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="btn">Start Reading</a>
    </div>
  `);
  await sendEmail({ to, subject: "Welcome to Global Awaaz!", html });
}
