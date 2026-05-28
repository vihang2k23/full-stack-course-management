/**
 * Auth API — signup/login, profile, logout, and password reset helpers.
 */
import { apiRequest } from './client';

/** Register with multipart FormData (name, email, password, role, image) */
export const signup = (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('signup requires FormData with user fields and profile image');
  }
  return apiRequest('/auth/signup', { method: 'POST', body: formData });
};

export const login = (body) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) });

/** Fetch current user from server (refreshes image and name) */
export const getProfile = () => apiRequest('/auth/me');

/** Update display name and profile photo (multipart FormData) */
export const updateProfile = (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('updateProfile requires FormData with profile image');
  }
  return apiRequest('/auth/profile', { method: 'PUT', body: formData });
};

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

export const getUserDashboard = () => apiRequest('/auth/user-dashboard');

export const getAdminDashboard = () => apiRequest('/auth/admin-dashboard');

export const forgotPassword = (body) =>
  apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });

export const verifyOtp = (body) =>
  apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });

export const resetPassword = (body) =>
  apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
