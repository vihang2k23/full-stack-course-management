import { apiRequest } from './client';

export const signup = (body) =>
  apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(body) });

export const login = (body) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

export const getUserDashboard = () => apiRequest('/auth/user-dashboard');

export const getAdminDashboard = () => apiRequest('/auth/admin-dashboard');

export const forgotPassword = (body) =>
  apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });

export const verifyOtp = (body) =>
  apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });

export const resetPassword = (body) =>
  apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
