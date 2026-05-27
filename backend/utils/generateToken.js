import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const saveUserToken = async (user) => {
  const token = generateToken(user);
  user.token = token;
  await user.save();
  return token;
};

export default generateToken;
export { saveUserToken };
