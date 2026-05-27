const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
};

export default errorHandler;
