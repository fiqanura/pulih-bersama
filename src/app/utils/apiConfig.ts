export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
// Untuk gambar atau akses root tanpa /api
export const BASE_URL = API_BASE_URL.replace('/api', '');
