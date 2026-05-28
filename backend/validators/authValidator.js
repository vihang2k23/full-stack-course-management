import { body } from 'express-validator';
import ROLES from '../constants/roles.constants.js';
import { USER_IMAGE_FIELD } from '../constants/upload.constants.js';
import { requireUploadedImage } from './uploadValidator.js';

// Validation rules for user registration.
// Ensures data integrity and enforces security constraints (like password strength)
// before the request hits the controller.
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail() // Stops running further validations on this field if the previous ones failed
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(), // Converts the email to a standard format (e.g., lowercase)

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role'),

  ...requireUploadedImage(USER_IMAGE_FIELD),
];

// Validation rules for user login.
// Basic checks to ensure required fields are present and formatted correctly.
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// Update profile — name optional, new profile image required
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  ...requireUploadedImage(USER_IMAGE_FIELD),
];
