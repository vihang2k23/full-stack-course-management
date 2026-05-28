import { body, param } from 'express-validator';
import { COURSE_IMAGE_FIELD } from '../constants/upload.constants.js';
import { requireUploadedImage } from './uploadValidator.js';

/**
 * Validates that route parameters intended to be MongoDB ObjectIds are structurally valid.
 * Prevents unnecessary database queries and CastErrors.
 */
export const courseIdValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),
];

/**
 * Strict validation for creating a new course.
 * All fields are required to guarantee data completeness.
 */
export const createCourseValidation = [
  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),

  body('courseDuration')
    .trim()
    .notEmpty()
    .withMessage('Course duration is required'),

  body('courseFees')
    .notEmpty()
    .withMessage('Course fees is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Course fees must be a non-negative number'),

  ...requireUploadedImage(COURSE_IMAGE_FIELD),
];

/**
 * Relaxed validation for updating a course.
 * Fields are optional, but if provided, they must conform to the correct types and constraints.
 */
export const updateCourseValidation = [
  body('courseName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course name cannot be empty'),

  body('courseDuration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course duration cannot be empty'),

  body('courseFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Course fees must be a non-negative number'),
];
