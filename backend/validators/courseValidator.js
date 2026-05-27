import { body, param } from 'express-validator';

export const courseIdValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),
];

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
];

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
