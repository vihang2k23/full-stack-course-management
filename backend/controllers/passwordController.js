import User from '../models/User.js';
import { hashPassword } from '../utils/authUtils.js';
import { sendResetEmail } from '../config/mailer.js';
import {
  generateOtp,
  generateResetLinkToken,
  hashOtp,
  compareOtp,
  generateResetJwt,
  verifyResetJwt,
} from '../utils/resetPassword.js';
import { RESET_EXPIRY_MS } from '../constants/reset.constants.js';

// Generic response to prevent user enumeration attacks.
// We return the same message whether the email exists or not.
const successMessage = {
  success: true,
  message: 'If that email exists, we sent reset instructions.',
};

// Initiates the password reset process by generating an OTP and sending it via email.
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Bail early if user doesn't exist, but pretend we succeeded for security.
    if (!user) {
      return res.json(successMessage);
    }

    // Generate necessary tokens and OTP
    const otp = generateOtp();
    const resetToken = generateResetLinkToken();
    const resetExpires = new Date(Date.now() + RESET_EXPIRY_MS);

    // Hash the OTP before saving to DB so it can't be stolen if DB is compromised.
    user.resetOtp = await hashOtp(otp);
    user.resetToken = resetToken;
    user.resetExpires = resetExpires;
    await user.save();

    try {
      // Attempt to send the email with the plain text OTP
      await sendResetEmail({ email: user.email, otp, resetToken });
    } catch (err) {
      console.error('Email send failed:', err.message);
      
      // Rollback database changes if email fails so the user isn't stuck in a reset state
      user.resetOtp = null;
      user.resetToken = null;
      user.resetExpires = null;
      await user.save();

      // Provide a helpful hint for common SMTP authentication issues
      const hint =
        err.message?.includes('Invalid login') ||
        err.message?.includes('authentication')
          ? ' Wrong email or app password. Use a Gmail App Password (16 chars, no spaces).'
          : '';

      return res.status(500).json({
        success: false,
        message: `Could not send email. Check SMTP settings.${hint}`,
        // Expose detailed errors only in development environment
        ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
      });
    }

    res.json(successMessage);
  } catch (error) {
    next(error);
  }
};

// Verifies the OTP provided by the user against the database record.
// On success, grants a temporary JWT to proceed with the actual password change.
export const verifyOtp = async (req, res, next) => {
  try {
    const { token, otp } = req.body;

    // Look for the user using the session token and ensure it hasn't expired yet
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() },
    });

    if (!user || !user.resetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Safely compare the provided OTP with the hashed version in the DB
    const isValid = await compareOtp(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Issue a short-lived JWT specifically for the final reset password step.
    // We don't just reset it here to separate the verification from the action.
    const resetJwt = generateResetJwt(user._id);

    res.json({
      success: true,
      message: 'OTP verified',
      resetToken: resetJwt, // Frontend will use this in the next request
    });
  } catch (error) {
    next(error);
  }
};

// Final step: Updates the user's password using the authorized JWT from the verify step.
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.body;

    let decoded;
    try {
      // Validate the reset JWT. If it fails (expired/tampered), it throws.
      decoded = verifyResetJwt(resetToken);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset session',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the new password and clean up all temporary reset fields to prevent reuse
    user.password = await hashPassword(password);
    user.token = null; // Clear active login sessions if applicable
    user.resetOtp = null;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};
