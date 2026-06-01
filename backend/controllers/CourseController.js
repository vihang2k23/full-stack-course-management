import Course from '../models/Course.js';

// Ensures the course belongs to the logged-in user (per-user course isolation)
const findOwnedCourse = (id, userId) =>
  Course.findOne({ _id: id, createdBy: userId });

// Creates a new course in the database.
// The request body must contain all required course fields.
export const createCourse = async (req, res, next) => {
  try {
    const courseData = {
      courseName: req.body.courseName,
      courseDuration: req.body.courseDuration,
      courseFees: Number(req.body.courseFees),
      image: `/uploads/courses/${req.file.filename}`,
    };

    const course = await Course.create({
      ...courseData,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error); // Pass validation or DB errors to the global error handler
  }
};

// Retrieves courses owned by the logged-in user, sorted by newest first.
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

// Fetches a single course by its unique ID.
// Returns a 404 if the ID is valid but no course is found.
export const getCourseById = async (req, res, next) => {
  try {
    const course = await findOwnedCourse(req.params.id, req.user.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error); // Will catch invalid ObjectIds (CastError)
  }
};

// Updates an existing course.
// Uses `new: true` to return the updated document and `runValidators: true` to ensure schema rules are respected.
export const updateCourse = async (req, res, next) => {
  try {
    const existingCourse = await findOwnedCourse(req.params.id, req.user.id);

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

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// Deletes a course from the database by its ID.
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};
