/** Password reset OTP lifetime and JWT expiry for the reset-password step */
const RESET_EXPIRY_MINUTES = Number(process.env.RESET_EXPIRY_MINUTES) || 60;

export const RESET_EXPIRY_MS = RESET_EXPIRY_MINUTES * 60 * 1000;
export const RESET_JWT_EXPIRES = process.env.RESET_JWT_EXPIRES || '1h';
