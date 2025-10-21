import AsyncStorage from '@react-native-async-storage/async-storage';
import {MMKV} from 'react-native-mmkv';
import {Keychain} from 'react-native-keychain';
import {STORAGE_KEYS, CACHE_EXPIRY} from '@/constants/storage';

// MMKV instance for fast key-value storage
const storage = new MMKV();

// Secure storage for sensitive data
class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(key, 'user', value);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(key);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      // Clear all keychain items (this is a simplified approach)
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  }
}

// Fast storage for non-sensitive data
class FastStorage {
  static setItem(key: string, value: string): void {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error('FastStorage setItem error:', error);
    }
  }

  static getItem(key: string): string | undefined {
    try {
      return storage.getString(key);
    } catch (error) {
      console.error('FastStorage getItem error:', error);
      return undefined;
    }
  }

  static removeItem(key: string): void {
    try {
      storage.delete(key);
    } catch (error) {
      console.error('FastStorage removeItem error:', error);
    }
  }

  static clear(): void {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('FastStorage clear error:', error);
    }
  }

  static setObject(key: string, value: any): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('FastStorage setObject error:', error);
    }
  }

  static getObject<T>(key: string): T | null {
    try {
      const value = this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('FastStorage getObject error:', error);
      return null;
    }
  }
}

// Cache storage with expiry
class CacheStorage {
  private static getCacheKey(key: string): string {
    return `cache_${key}`;
  }

  private static getExpiryKey(key: string): string {
    return `cache_expiry_${key}`;
  }

  static setItem(key: string, value: any, expiryMs: number = CACHE_EXPIRY.MEDIUM): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const expiryKey = this.getExpiryKey(key);
      const expiryTime = Date.now() + expiryMs;

      FastStorage.setObject(cacheKey, value);
      FastStorage.setItem(expiryKey, expiryTime.toString());
    } catch (error) {
      console.error('CacheStorage setItem error:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const expiryKey = this.getExpiryKey(key);
      
      const expiryTime = FastStorage.getItem(expiryKey);
      if (!expiryTime || Date.now() > parseInt(expiryTime, 10)) {
        // Cache expired, remove it
        this.removeItem(key);
        return null;
      }

      return FastStorage.getObject<T>(cacheKey);
    } catch (error) {
      console.error('CacheStorage getItem error:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const expiryKey = this.getExpiryKey(key);
      
      FastStorage.removeItem(cacheKey);
      FastStorage.removeItem(expiryKey);
    } catch (error) {
      console.error('CacheStorage removeItem error:', error);
    }
  }

  static clear(): void {
    try {
      // This is a simplified approach - in production, you might want to
      // iterate through all keys and remove only cache keys
      FastStorage.clear();
    } catch (error) {
      console.error('CacheStorage clear error:', error);
    }
  }
}

// Legacy AsyncStorage wrapper for compatibility
class LegacyStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('LegacyStorage setItem error:', error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('LegacyStorage getItem error:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('LegacyStorage removeItem error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('LegacyStorage clear error:', error);
    }
  }

  static async setObject(key: string, value: any): Promise<void> {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LegacyStorage setObject error:', error);
    }
  }

  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('LegacyStorage getObject error:', error);
      return null;
    }
  }
}

export {SecureStorage, FastStorage, CacheStorage, LegacyStorage};