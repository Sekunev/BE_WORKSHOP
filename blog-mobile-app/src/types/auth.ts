// Authentication related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
}

export interface BiometricAuthOptions {
  promptMessage?: string;
  keychainOptions?: {
    accessControl?: string;
    authenticatePrompt?: string;
    fallbackPrompt?: string;
    cancelPrompt?: string;
  };
}