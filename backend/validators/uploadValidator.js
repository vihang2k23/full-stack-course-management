import { body } from 'express-validator';

/**
 * Ensures Multer attached a file (runs after upload middleware).
 * express-validator does not validate multipart files by default.
 */
export const requireUploadedImage = (fieldName = 'image') => [
  body().custom((_, { req }) => {
    if (!req.file) {
      throw new Error(
        `Image is required. Send multipart/form-data with file field "${fieldName}".`
      );
    }
    return true;
  }),
];
