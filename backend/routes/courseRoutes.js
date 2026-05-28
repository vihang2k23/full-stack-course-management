// Course routes — all require auth; create/update use multipart image upload.
import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import {
  courseIdValidation,
  createCourseValidation,
  updateCourseValidation,
} from '../validators/courseValidator.js';
import upload from '../middleware/uploadMiddleware.js';
import { COURSE_IMAGE_FIELD } from '../constants/upload.constants.js';

// Multer middleware — expects form field name "image"
const courseImageUpload = upload.single(COURSE_IMAGE_FIELD);

// Reject JSON body on create — course POST must be multipart/form-data
const requireMultipartBody = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      message:
        'Course create/update requires multipart/form-data (FormData), not JSON. Include field "' +
        COURSE_IMAGE_FIELD +
        '" for the image file.',
    });
  }
  next();
};

const router = express.Router();

// Apply global authentication guard to all course routes implicitly
router.use(authMiddleware);

// --- Collection Level Routes ---
router
  .route('/')
  .get(getAllCourses) // Retrieve all courses
  .post(
    requireMultipartBody,
    courseImageUpload,
    createCourseValidation,
    validateMiddleware,
    createCourse
  );

// --- Document Level Routes ---
router
  .route('/:id')
  .get(courseIdValidation, validateMiddleware, getCourseById) // Retrieve a single course
  .put(
    requireMultipartBody,
    courseImageUpload,
    courseIdValidation,
    updateCourseValidation,
    validateMiddleware,
    updateCourse
  )
  .delete(courseIdValidation, validateMiddleware, deleteCourse); // Delete a course

export default router;
