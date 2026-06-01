import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verifies JWT and active session; attaches user to req (express reference: policies/isTokenVerified)
const isTokenVerified = async (req, res, next) => {
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

    if (decoded.purpose === 'password_reset') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(decoded.id).select('token role name email image');

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
      image: user.image || '',
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export { isTokenVerified };
export default isTokenVerified;
