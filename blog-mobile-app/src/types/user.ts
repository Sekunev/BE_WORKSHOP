// User related types
import {User} from './auth';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface UserState {
  profile: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}