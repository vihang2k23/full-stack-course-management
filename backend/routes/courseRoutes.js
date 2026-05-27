import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  courseIdValidation,
  createCourseValidation,
  updateCourseValidation,
} from '../validators/courseValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getAllCourses).post(createCourseValidation, validate, createCourse);

router
  .route('/:id')
  .get(courseIdValidation, validate, getCourseById)
  .put(courseIdValidation, updateCourseValidation, validate, updateCourse)
  .delete(courseIdValidation, validate, deleteCourse);

export default router;
