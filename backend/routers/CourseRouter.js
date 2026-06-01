// Course routes — all require auth; create/update use multipart image upload.
import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/CourseController.js';
import { isTokenVerified } from '../policies/isTokenVerified.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import {
  courseIdValidation,
  createCourseValidation,
  updateCourseValidation,
} from '../validators/courseValidationRules.js';
import courseUpload from '../config/courseMulter.js';
import { COURSE_IMAGE_FIELD } from '../constants/upload.js';

const courseImageUpload = courseUpload.single(COURSE_IMAGE_FIELD);

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

router.use(isTokenVerified);

router
  .route('/')
  .get(getAllCourses)
  .post(
    requireMultipartBody,
    courseImageUpload,
    createCourseValidation,
    validateMiddleware,
    createCourse
  );

router
  .route('/:id')
  .get(courseIdValidation, validateMiddleware, getCourseById)
  .put(
    requireMultipartBody,
    courseImageUpload,
    courseIdValidation,
    updateCourseValidation,
    validateMiddleware,
    updateCourse
  )
  .delete(courseIdValidation, validateMiddleware, deleteCourse);

export default router;
