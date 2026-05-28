/**
 * Builds a full URL for image paths stored in MongoDB (files served from the API host).
 */
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
).replace(/\/api\/v1\/?$/, '');

/** Build full URL for image paths stored in MongoDB (files live on API server disk). */
export const uploadImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_ORIGIN}${normalized}`;
};
