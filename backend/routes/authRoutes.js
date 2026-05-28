/**
 * Authentication routes: signup, login, profile, logout, and password reset flow.
 */
import express from 'express';
import {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
} from '../controllers/userController.js';
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/passwordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import userUpload from '../middleware/userUploadMiddleware.js';
import {
  signupValidation,
  loginValidation,
  updateProfileValidation,
} from '../validators/authValidator.js';
import {
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} from '../validators/passwordValidator.js';
import { USER_IMAGE_FIELD } from '../constants/upload.constants.js';
import ROLES from '../constants/roles.constants.js';

// Multer middleware — expects form field name "image"
const profileImageUpload = userUpload.single(USER_IMAGE_FIELD);

/** Rejects requests that are not multipart/form-data (required for file upload) */
const requireMultipart = (action) => (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      message: `${action} requires multipart/form-data (FormData) with field "${USER_IMAGE_FIELD}" for the profile image.`,
    });
  }
  next();
};

const router = express.Router();

// --- Core Authentication Flow ---
router.post(
  '/signup',
  requireMultipart('Signup'),
  profileImageUpload,
  signupValidation,
  validateMiddleware,
  signup
);
router.post('/login', loginValidation, validateMiddleware, login);
router.get('/me', authMiddleware, getProfile);
router.put(
  '/profile',
  authMiddleware,
  requireMultipart('Profile update'),
  profileImageUpload,
  updateProfileValidation,
  validateMiddleware,
  updateProfile
);
router.post('/logout', authMiddleware, logout);

// --- Password Recovery Flow ---
router.post('/forgot-password', forgotPasswordValidation, validateMiddleware, forgotPassword);
router.post('/verify-otp', verifyOtpValidation, validateMiddleware, verifyOtp);
router.post('/reset-password', resetPasswordValidation, validateMiddleware, resetPassword);

// --- Role-Based Access Control (RBAC) Demos ---

router.get('/user-dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== ROLES.USER) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    message: 'Welcome User',
  });
});

router.get('/admin-dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    message: 'Welcome Admin',
  });
});

export default router;
