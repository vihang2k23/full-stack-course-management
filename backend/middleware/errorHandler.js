// Global centralized error handling middleware.
const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5MB'
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
};

export default errorHandler;
