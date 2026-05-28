import express from 'express';
import { signup, login, logout } from '../controllers/userController.js';
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/passwordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import { signupValidation, loginValidation } from '../validators/authValidator.js';
import {
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} from '../validators/passwordValidator.js';
import ROLES from '../constants/roles.constants.js';

const router = express.Router();

// --- Core Authentication Flow ---
router.post('/signup', signupValidation, validateMiddleware, signup);
router.post('/login', loginValidation, validateMiddleware, login);
router.post('/logout', authMiddleware, logout);

// --- Password Recovery Flow ---
router.post('/forgot-password', forgotPasswordValidation, validateMiddleware, forgotPassword);
router.post('/verify-otp', verifyOtpValidation, validateMiddleware, verifyOtp);
router.post('/reset-password', resetPasswordValidation, validateMiddleware, resetPassword);

// --- Role-Based Access Control (RBAC) Demos ---

/**
 * User Dashboard Endpoint
 * Strictly restricted to standard users.
 */
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

/**
 * Admin Dashboard Endpoint
 * Strictly restricted to administrators.
 */
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
