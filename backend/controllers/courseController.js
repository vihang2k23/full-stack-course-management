import Course from '../models/Course.js';

/**
 * Creates a new course in the database.
 * The request body must contain all required course fields.
 */
export const createCourse = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Course image is required. Send multipart/form-data with file field "image".',
      });
    }

    const courseData = {
      courseName: req.body.courseName,
      courseDuration: req.body.courseDuration,
      courseFees: Number(req.body.courseFees),
      image: `/uploads/courses/${req.file.filename}`,
    };

    const course = await Course.create(courseData);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error); // Pass validation or DB errors to the global error handler
  }
};

/**
 * Retrieves all available courses, sorted by newest first.
 */
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches a single course by its unique ID.
 * Returns a 404 if the ID is valid but no course is found.
 */
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error); // Will catch invalid ObjectIds (CastError)
  }
};

/**
 * Updates an existing course.
 * Uses `new: true` to return the updated document and `runValidators: true` to ensure schema rules are respected.
 */
export const updateCourse = async (req, res, next) => {
  try {


     const existingCourse = await Course.findById(req.params.id);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const updatedData = {
      courseName: req.body.courseName ?? existingCourse.courseName,
      courseDuration: req.body.courseDuration ?? existingCourse.courseDuration,
      courseFees:
        req.body.courseFees !== undefined
          ? Number(req.body.courseFees)
          : existingCourse.courseFees,
      image: req.file
        ? `/uploads/courses/${req.file.filename}`
        : existingCourse.image,
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a course from the database by its ID.
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};
