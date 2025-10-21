import api from './api';

export interface UpdateProfileRequest {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  status: string;
  message: string;
  data: {
    user: any;
  };
}

class UserService {
  // Profil güncelle
  async updateProfile(userData: UpdateProfileRequest): Promise<UserResponse> {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      throw error;
    }
  }

  // Şifre değiştir
  async changePassword(passwordData: ChangePasswordRequest): Promise<UserResponse> {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirilemedi:', error);
      throw error;
    }
  }

  // Kullanıcı profili getir
  async getProfile(): Promise<UserResponse> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Profil alınamadı:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;