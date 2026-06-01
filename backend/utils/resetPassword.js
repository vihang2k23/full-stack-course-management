import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { RESET_JWT_EXPIRES } from '../constants/reset.js';

// Generates a random 6-digit One Time Password (OTP).
export const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// Generates a cryptographically secure random token for session tracking.
export const generateResetLinkToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hashes the OTP before saving to the database to prevent exposure of active OTPs.
export const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

// Compares a plain-text OTP with a hashed OTP to verify correctness.
export const compareOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

// Generates a short-lived JSON Web Token (JWT) authorizing the user to reset their password.
export const generateResetJwt = (userId) => {
  return jwt.sign(
    { id: userId, purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: RESET_JWT_EXPIRES }
  );
};

// Verifies the validity of the reset JWT and ensures it is explicitly for password resets.
export const verifyResetJwt = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Ensure we don't accidentally accept an auth token for a password reset
  if (decoded.purpose !== 'password_reset') {
    throw new Error('Invalid reset token');
  }
  return decoded;
};
