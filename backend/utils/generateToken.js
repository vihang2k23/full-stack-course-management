import jwt from 'jsonwebtoken';

/**
 * Generates a standard JSON Web Token (JWT) for user sessions.
 * Encodes the user's ID and Role, and sets a 7-day expiration.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Generates a new token and saves it directly to the user's database record.
 * This allows for single-session enforcement (invalidating previous tokens).
 */
const saveUserToken = async (user) => {
  const token = generateToken(user);
  user.token = token;
  await user.save();
  return token;
};

export default generateToken;
export { saveUserToken };
