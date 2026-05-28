import { body } from 'express-validator';

/**
 * Validates the initial request to send a password reset OTP.
 */
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

/**
 * Validates the OTP verification step.
 * Ensures both the session token and a 6-digit OTP are provided.
 */
export const verifyOtpValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
];

/**
 * Validates the final password reset step.
 * Checks for the temporary JWT (resetToken) and enforces the new password strength.
 */
export const resetPasswordValidation = [
  body('resetToken').notEmpty().withMessage('Reset session token is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];
