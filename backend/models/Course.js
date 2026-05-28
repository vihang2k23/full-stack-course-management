import mongoose from 'mongoose';

// Mongoose schema definition for the Course model.
// Maps directly to the 'courses' collection in MongoDB.
const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    courseDuration: {
      type: String,
      required: [true, 'Course duration is required'],
      trim: true,
    },
    courseFees: {
      type: Number,
      required: [true, 'Course fees is required'],
      min: [0, 'Course fees cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
