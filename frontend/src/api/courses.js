import { apiRequest } from './client';

export const getCourses = () => apiRequest('/courses');

export const getCourse = (id) => apiRequest(`/courses/${id}`);

export const createCourse = (body) =>
  apiRequest('/courses', { method: 'POST', body: JSON.stringify(body) });

export const updateCourse = (id, body) =>
  apiRequest(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteCourse = (id) =>
  apiRequest(`/courses/${id}`, { method: 'DELETE' });
