import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Global authentication middleware.
// Verifies JWT tokens and attaches the authenticated user to the request object.
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Enforce Bearer token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Prevent 'password_reset' tokens from being used for standard API authentication
    if (decoded.purpose === 'password_reset') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Verify user exists and the token matches the active session in the database
    const user = await User.findById(decoded.id).select('token role name email');

    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    // Attach minimal user info to the request for downstream controllers
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export default authMiddleware;
