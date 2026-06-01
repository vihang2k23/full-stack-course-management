// Authentication routes: signup, login, profile, logout, and password reset flow.
import express from 'express';
import {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
} from '../controllers/UserController.js';
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/PasswordController.js';
import { isTokenVerified } from '../policies/isTokenVerified.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import userUpload from '../config/userMulter.js';
import {
  signupValidation,
  loginValidation,
  updateProfileValidation,
} from '../validators/authValidationRules.js';
import {
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} from '../validators/passwordValidationRules.js';
import { USER_IMAGE_FIELD } from '../constants/upload.js';
import ROLES from '../constants/roles.js';

const profileImageUpload = userUpload.single(USER_IMAGE_FIELD);

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

router.post(
  '/signup',
  requireMultipart('Signup'),
  profileImageUpload,
  signupValidation,
  validateMiddleware,
  signup
);
router.post('/login', loginValidation, validateMiddleware, login);
router.get('/me', isTokenVerified, getProfile);
router.put(
  '/profile',
  isTokenVerified,
  requireMultipart('Profile update'),
  profileImageUpload,
  updateProfileValidation,
  validateMiddleware,
  updateProfile
);
router.post('/logout', isTokenVerified, logout);

router.post('/forgot-password', forgotPasswordValidation, validateMiddleware, forgotPassword);
router.post('/verify-otp', verifyOtpValidation, validateMiddleware, verifyOtp);
router.post('/reset-password', resetPasswordValidation, validateMiddleware, resetPassword);

router.get('/user-dashboard', isTokenVerified, (req, res) => {
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

router.get('/admin-dashboard', isTokenVerified, (req, res) => {
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
