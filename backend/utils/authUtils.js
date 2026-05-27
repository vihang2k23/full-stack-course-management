import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  const salt = 10;
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
