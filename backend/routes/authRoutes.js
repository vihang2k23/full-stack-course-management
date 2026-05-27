import express from 'express';
import { signup, login, logout } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { signupValidation, loginValidation } from '../validators/authValidator.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/logout', authMiddleware, logout);

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
