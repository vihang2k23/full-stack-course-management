import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('token role name email');

    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

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
