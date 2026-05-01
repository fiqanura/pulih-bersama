import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    // Sanctum token auth
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error: unknown): string | null => {
  const err = error as AxiosError<any>;
  const data = err?.response?.data;

  if (data && typeof data === 'object') {
    const message = (data as any).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  return null;
};
