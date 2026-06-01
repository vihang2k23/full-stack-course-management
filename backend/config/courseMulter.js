// Multer configuration for course thumbnail images.
// Saves files to uploads/courses/ with a unique timestamp-based filename.
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { COURSE_UPLOADS_DIR } from '../config/paths.js';
import { MAX_IMAGE_SIZE_BYTES } from '../constants/upload.js';

if (!fs.existsSync(COURSE_UPLOADS_DIR)) {
  fs.mkdirSync(COURSE_UPLOADS_DIR, { recursive: true });
}

// Disk storage — destination folder and unique filename per upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COURSE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Allow only common image types (mimetype + extension)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter,
});

export default upload;
