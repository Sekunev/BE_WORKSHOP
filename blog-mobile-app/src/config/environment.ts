import { Platform } from 'react-native';

export interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  APP_NAME: string;
  APP_VERSION: string;
  BUILD_NUMBER: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_APP_ID: string;
  ENABLE_CRASHLYTICS: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_FLIPPER: boolean;
  DEBUG_MODE: boolean;
  PACKAGE_NAME: string;
}

// Environment configuration based on build type
const isDevelopment = __DEV__;
const isProd = !__DEV__;

// Default configuration
const defaultConfig: AppConfig = {
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:5000/api' 
    : 'https://api.yourdomain.com/api',
  API_TIMEOUT: 10000,
  APP_NAME: 'Blog Mobile App',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  FIREBASE_PROJECT_ID: isDevelopment 
    ? 'blog-mobile-app-dev' 
    : 'blog-mobile-app-prod',
  FIREBASE_APP_ID: Platform.select({
    android: isDevelopment 
      ? '1:123456789:android:devabcdef' 
      : '1:123456789:android:abcdef',
    ios: isDevelopment 
      ? '1:123456789:ios:devabcdef' 
      : '1:123456789:ios:abcdef',
    default: '',
  }),
  ENABLE_CRASHLYTICS: false,
  ENABLE_ANALYTICS: false,
  ENABLE_FLIPPER: isDevelopment,
  DEBUG_MODE: isDevelopment,
  PACKAGE_NAME: Platform.select({
    android: isDevelopment 
      ? 'com.blogapp.mobile.dev' 
      : 'com.blogapp.mobile',
    ios: isDevelopment 
      ? 'com.blogapp.mobile.dev' 
      : 'com.blogapp.mobile',
    default: 'com.blogapp.mobile',
  }),
};

// Export the configuration
export const Config: AppConfig = {
  ...defaultConfig,
  // Override with environment variables if available
  // Note: In React Native, environment variables need to be handled differently
  // This is a placeholder for the structure
};

// Helper functions
export const isDebugMode = (): boolean => Config.DEBUG_MODE;
export const isProduction = (): boolean => !Config.DEBUG_MODE;
export const getApiBaseUrl = (): string => Config.API_BASE_URL;
export const getAppVersion = (): string => `${Config.APP_VERSION} (${Config.BUILD_NUMBER})`;

export default Config;