import bcrypt from 'bcrypt';

/**
 * Securely hashes a plain-text password using bcrypt with a salt round of 10.
 */
const hashPassword = async (password) => {
  const salt = 10;
  return bcrypt.hash(password, salt);
};

/**
 * Verifies a plain-text password against a stored hashed password.
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
