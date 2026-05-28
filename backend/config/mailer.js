import nodemailer from 'nodemailer';
import { RESET_EXPIRY_MS } from '../constants/reset.constants.js';

// Convert milliseconds to minutes for the email template display
const resetExpiryMinutes = Math.round(RESET_EXPIRY_MS / 60000);

/**
 * Determines the frontend URL dynamically based on environment variables.
 * Falls back to localhost for local development environments.
 */
const getFrontendUrl = () => {
  const urls = process.env.CLIENT_URL?.split(',').map((u) => u.trim()) || [];
  return urls.find((u) => u.includes('5173')) || urls[0] || 'http://localhost:5173';
};

const getFromAddress = () =>
  process.env.MAIL_FROM?.trim() ||
  `"Course App" <${process.env.SMTP_USER.trim()}>`;

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
  });
};

/**
 * Configures and returns a Nodemailer transporter instance.
 * Supports both Gmail service shortcuts and generic SMTP configurations.
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, '');

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS are required in .env');
  }

  const auth = { user, pass };

  if (process.env.SMTP_HOST?.includes('gmail')) {
    return nodemailer.createTransport({ service: 'gmail', auth });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth,
  });
};

/**
 * Sends a welcome email after successful signup.
 */
export const sendWelcomeEmail = async ({ email, name }) => {
  const frontendUrl = getFrontendUrl();
  const loginLink = `${frontendUrl}/login`;

  await sendEmail({
    to: email,
    subject: 'Welcome to Course App',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account was created successfully.</p>
      <p>You can sign in anytime here:</p>
      <a href="${loginLink}">${loginLink}</a>
    `,
  });
};

/**
 * Sends a password reset email containing both a secure OTP and a direct fallback link.
 */
export const sendResetEmail = async ({ email, otp, resetToken }) => {
  const frontendUrl = getFrontendUrl();
  const resetLink = `${frontendUrl}/verify-otp?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password reset</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>It expires in ${resetExpiryMinutes} minutes.</p>
      <p>Or click the link below and enter the OTP:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};
