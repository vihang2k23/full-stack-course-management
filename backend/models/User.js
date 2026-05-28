import mongoose from 'mongoose';
import ROLES from '../constants/roles.constants.js';

/**
 * Mongoose schema definition for the User model.
 * Handles core user data, authentication state, and password reset fields.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Ensures no two users can register with the same email
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES), // Restricts role values to predefined constants (e.g., USER, ADMIN)
      default: ROLES.USER,
    },
    // Used to track the active session. If null, the user is logged out.
    token: {
      type: String,
      default: null,
    },
    // --- Temporary fields used exclusively for the forgot/reset password flow ---
    resetOtp: {
      type: String,
      default: null, // Stores the hashed OTP securely
    },
    resetToken: {
      type: String,
      default: null, // Stores the session token mapping to the current OTP request
    },
    resetExpires: {
      type: Date,
      default: null, // Expiration timestamp for the OTP
    },
  },
  // Automatically manages 'createdAt' and 'updatedAt' timestamps
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
