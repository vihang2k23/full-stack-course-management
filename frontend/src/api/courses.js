// Course API — CRUD for the logged-in user's courses (multipart for create/update).
import { apiRequest } from './client';
import { uploadImageUrl } from './uploads.js';

export const courseImageUrl = uploadImageUrl;

// List courses owned by the current user
export const getCourses = () => apiRequest('/courses');

export const createCourse = (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('createCourse requires FormData with course fields and image file');
  }
  return apiRequest('/courses', { method: 'POST', body: formData });
};

export const updateCourse = (id, formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('updateCourse requires FormData');
  }
  return apiRequest(`/courses/${id}`, { method: 'PUT', body: formData });
};

export const deleteCourse = (id) =>
  apiRequest(`/courses/${id}`, { method: 'DELETE' });
