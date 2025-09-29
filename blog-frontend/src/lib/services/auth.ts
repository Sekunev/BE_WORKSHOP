import api from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
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
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  bio?: string;
  avatar?: string;
}

export const authService = {
  // Kullanıcı girişi
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  // Kullanıcı kaydı
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  // Kullanıcı profilini getir
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  // Şifre değiştir
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/auth/change-password', data);
  },

  // Token yenile
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Debug token
  debugToken: async (): Promise<unknown> => {
    const response = await api.get('/auth/debug');
    return response.data.data;
  },

  // Profil güncelle
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data.data.user;
  },
};
