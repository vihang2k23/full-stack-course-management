const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      data.errors?.map((e) => e.message).join(', ') ||
      'Something went wrong';
    throw new Error(message);
  }

  return data;
}
