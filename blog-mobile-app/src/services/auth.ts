import {apiService} from './api';
import {SecureStorage} from './storage';
import {STORAGE_KEYS} from '@/constants/storage';
import {API_ENDPOINTS} from '@/constants/api';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  TokenPair,
  BiometricAuthOptions,
} from '@/types/auth';
import {Keychain} from 'react-native-keychain';

class AuthService {
  private tokenRefreshPromise: Promise<TokenPair> | null = null;
  private isRefreshing = false;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data) {
        await this.storeAuthData(response.data);
      }

      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      if (response.data) {
        await this.storeAuthData(response.data);
      }

      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.performCompleteLogout();
    }
  }

  private async performCompleteLogout(): Promise<void> {
    try {
      // Stop automatic token renewal
      const {tokenManager} = await import('@/utils/tokenManager');
      tokenManager.stopAutoRenewal();
      
      // Clear all auth-related data
      await this.clearAuthData();
      
      // Clear biometric credentials if enabled
      await this.disableBiometricAuth();
      
      // Clear any cached user data
      await this.clearUserCache();
      
      // Reset any ongoing token refresh
      this.isRefreshing = false;
      this.tokenRefreshPromise = null;
    } catch (error) {
      console.error('Error during complete logout:', error);
    }
  }

  private async clearUserCache(): Promise<void> {
    try {
      // Clear any additional user-related cache data
      // This can be extended based on what other data needs to be cleared
      await SecureStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      console.error('Failed to clear user cache:', error);
    }
  }

  async refreshToken(): Promise<TokenPair> {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing && this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.isRefreshing = true;
    this.tokenRefreshPromise = this.performTokenRefresh();

    try {
      const result = await this.tokenRefreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.tokenRefreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<TokenPair> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<{
        accessToken: string;
        refreshToken: string;
      }>(API_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      });

      if (response.data) {
        await this.storeTokens(response.data);
        return response.data;
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      await this.clearAuthData();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>(API_ENDPOINTS.PROFILE);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getStoredAccessToken();
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }

  async initializeAuth(): Promise<void> {
    try {
      const accessToken = await this.getStoredAccessToken();
      if (accessToken) {
        apiService.setAuthToken(accessToken);
        
        // Start automatic token renewal
        const {tokenManager} = await import('@/utils/tokenManager');
        await tokenManager.startAutoRenewal();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  async getStoredAccessToken(): Promise<string | null> {
    return await SecureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getStoredRefreshToken(): Promise<string | null> {
    return await SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async enableBiometricAuth(options?: BiometricAuthOptions): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      if (!biometryType) {
        throw new Error('Biometric authentication not supported');
      }

      const credentials = await this.getStoredCredentials();
      if (!credentials) {
        throw new Error('No stored credentials found');
      }

      await Keychain.setInternetCredentials(
        STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
        credentials.username,
        credentials.password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          authenticatePrompt: options?.promptMessage || 'Authenticate to access your account',
          ...options?.keychainOptions,
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      return false;
    }
  }

  async authenticateWithBiometrics(options?: BiometricAuthOptions): Promise<boolean> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
        {
          authenticatePrompt: options?.promptMessage || 'Authenticate to access your account',
          ...options?.keychainOptions,
        }
      );

      if (credentials) {
        // Attempt login with stored credentials
        const loginResponse = await this.login({
          email: credentials.username,
          password: credentials.password,
        });
        return !!loginResponse;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async disableBiometricAuth(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
    } catch (error) {
      console.error('Failed to disable biometric auth:', error);
    }
  }

  async isBiometricAuthEnabled(): Promise<boolean> {
    try {
      const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
      return !!credentials;
    } catch (error) {
      return false;
    }
  }

  async getSupportedBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      return null;
    }
  }



  private async getStoredCredentials(): Promise<{username: string; password: string} | null> {
    try {
      // This would typically store hashed credentials or use a different approach
      // For demo purposes, we'll return null as we don't want to store plain passwords
      return null;
    } catch (error) {
      return null;
    }
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken.token),
        SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken.token),
        SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user)),
      ]);
      
      // Set auth token in API service
      apiService.setAuthToken(authData.accessToken.token);
      
      // Start automatic token renewal
      const {tokenManager} = await import('@/utils/tokenManager');
      await tokenManager.startAutoRenewal();
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  private async storeTokens(tokens: TokenPair): Promise<void> {
    try {
      await Promise.all([
        SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);
      
      // Update auth token in API service
      apiService.setAuthToken(tokens.accessToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);
      
      // Clear auth token from API service
      apiService.setAuthToken(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }
}

export const authService = new AuthService();