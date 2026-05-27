import { apiRequest } from './client';

export const signup = (body) =>
  apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(body) });

export const login = (body) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

export const getUserDashboard = () => apiRequest('/auth/user-dashboard');

export const getAdminDashboard = () => apiRequest('/auth/admin-dashboard');
