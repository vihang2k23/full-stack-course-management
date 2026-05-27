import mongoose from 'mongoose';

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
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
