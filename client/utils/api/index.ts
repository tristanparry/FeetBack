import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/constants/app';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = ['/users/login', '/users'].includes(
      originalRequest.url,
    );
    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;
      if (status === 401) {
        try {
          const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_KEY);
          if (!refreshToken) throw new Error('No refresh token');
          const response = await axios.post(`${BASE_URL}/users/refresh`, {
            refreshToken,
          });
          const { accessToken: newAccessToken } = response.data;
          await AsyncStorage.setItem(AUTH_ACCESS_KEY, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          await AsyncStorage.removeItem(AUTH_ACCESS_KEY);
          await AsyncStorage.removeItem(AUTH_REFRESH_KEY);
          throw err;
        }
      }
      await AsyncStorage.removeItem(AUTH_ACCESS_KEY);
      await AsyncStorage.removeItem(AUTH_REFRESH_KEY);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default api;
