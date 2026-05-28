import { apiRequest } from './client';

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/api\/v1\/?$/, '');

/** Build full URL for image path stored in MongoDB (files live on API server disk). */
export const courseImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_ORIGIN}${normalized}`;
};

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
