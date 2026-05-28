import User from '../models/User.js';
import { saveUserToken } from '../utils/generateToken.js';
import { hashPassword, comparePassword } from '../utils/authUtils.js';
import { sendWelcomeEmail } from '../config/mailer.js';
import ROLES from '../constants/roles.constants.js';

// Helper function to strip sensitive data (like passwords and tokens) before sending to the client
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * Registers a new user.
 * Hashes the password and automatically issues an auth token upon successful registration.
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing user to prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash the password manually before creation
    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: role || ROLES.USER,
    });

    const token = await saveUserToken(user);

    try {
      await sendWelcomeEmail({ email: user.email, name: user.name });
    } catch (err) {
      console.error('Welcome email send failed:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates a user by email and password, issuing a new session token on success.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Use generic error messages to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Invalidate old tokens and issue a new one to ensure single active session (if token logic is implemented this way)
    const token = await saveUserToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs out the user by clearing their active token from the database.
 */
export const logout = async (req, res, next) => {
  try {
    // req.user is populated by the authMiddleware
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
