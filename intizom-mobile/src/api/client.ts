import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — token qo'shish
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — token yangilash
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        if (original.headers) {
          original.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
