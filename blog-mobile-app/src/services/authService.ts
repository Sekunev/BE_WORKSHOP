import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: {
      token: string;
      expiresAt: string;
      expiresIn: string;
    };
    refreshToken: {
      token: string;
      expiresAt: string;
    };
  };
}

class AuthService {
  // Giriş yap
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Token'ı kaydet
      if (response.data.data?.accessToken?.token) {
        const token = response.data.data.accessToken.token;
        const refreshToken = response.data.data.refreshToken.token;
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // API header'ına da ekle
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Token kaydedildi:', token.substring(0, 50) + '...');
      }
      
      return response.data;
    } catch (error) {
      console.error('Giriş yapılamadı:', error);
      throw error;
    }
  }

  // Kayıt ol
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Token'ı kaydet
      if (response.data.data?.accessToken?.token) {
        const token = response.data.data.accessToken.token;
        const refreshToken = response.data.data.refreshToken.token;
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // API header'ına da ekle
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Token kaydedildi:', token.substring(0, 50) + '...');
      }
      
      return response.data;
    } catch (error) {
      console.error('Kayıt yapılamadı:', error);
      throw error;
    }
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
      // API header'ından da kaldır
      delete api.defaults.headers.common['Authorization'];
      
      console.log('✅ Çıkış yapıldı, token temizlendi');
    } catch (error) {
      console.error('Çıkış yapılamadı:', error);
      throw error;
    }
  }

  // Token kontrol et
  async checkToken(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (!token || !userStr) {
        return null;
      }
      
      // Token'ı API header'ına ekle
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Token kontrol edilemedi:', error);
      return null;
    }
  }

  // Profil bilgilerini getir
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;