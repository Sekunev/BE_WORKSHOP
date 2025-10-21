import axios from 'axios';

// API Base URL - Backend server adresi
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator için localhost

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token eklemek için
api.interceptors.request.use(
  async (config) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token eklendi:', token.substring(0, 50) + '...');
      } else {
        console.log('⚠️ Token bulunamadı');
      }
    } catch (error) {
      console.error('❌ Token alınamadı:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi için
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, logout yap
      // TODO: Logout logic
    }
    return Promise.reject(error);
  }
);

export default api;