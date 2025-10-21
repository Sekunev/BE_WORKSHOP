// Import crashlytics conditionally
let crashlytics: any = null;
try {
  crashlytics = require('@react-native-firebase/crashlytics').default;
} catch (error) {
  console.warn('Firebase Crashlytics not available:', error);
}
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { analyticsService } from './analyticsService';

export interface ErrorLog {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    userId?: string;
    screen?: string;
    action?: string;
    additionalInfo?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

class ErrorHandlingService {
  private errorLogs: ErrorLog[] = [];
  private maxStoredLogs = 500;

  // Initialize error handling service
  async initialize(): Promise<void> {
    try {
      // Enable Crashlytics collection if available
      if (crashlytics) {
        await crashlytics().setCrashlyticsCollectionEnabled(true);
      }
      
      // Load stored error logs
      await this.loadStoredLogs();
      
      console.log('Error handling service initialized');
    } catch (error) {
      console.error('Error initializing error handling service:', error);
    }
  }

  // Log error with context
  async logError(
    error: Error,
    context: ErrorLog['context'] = {},
    severity: ErrorLog['severity'] = 'medium',
    handled: boolean = true
  ): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        severity,
        handled,
      };

      // Add to local logs
      this.errorLogs.unshift(errorLog);
      
      // Keep only max stored logs
      if (this.errorLogs.length > this.maxStoredLogs) {
        this.errorLogs = this.errorLogs.slice(0, this.maxStoredLogs);
      }

      // Store locally
      await this.storeErrorLogs();

      // Log to Crashlytics
      await this.logToCrashlytics(error, context, severity, handled);

      // Track in analytics
      await analyticsService.trackEvent('error_occurred', {
        errorName: error.name,
        errorMessage: error.message,
        severity,
        handled,
        screen: context.screen,
        action: context.action,
      }, context.userId);

      // Log to console in development
      if (__DEV__) {
        console.error('Error logged:', {
          error: error.message,
          context,
          severity,
          handled,
        });
      }
    } catch (logError) {
      console.error('Error logging error:', logError);
    }
  }

  // Log to Crashlytics
  private async logToCrashlytics(
    error: Error,
    context: ErrorLog['context'],
    severity: ErrorLog['severity'],
    handled: boolean
  ): Promise<void> {
    try {
      if (!crashlytics) {
        return; // Crashlytics not available
      }

      // Set user context
      if (context.userId) {
        await crashlytics().setUserId(context.userId);
      }

      // Set custom attributes
      if (context.screen) {
        await crashlytics().setAttribute('screen', context.screen);
      }
      
      if (context.action) {
        await crashlytics().setAttribute('action', context.action);
      }

      await crashlytics().setAttribute('severity', severity);
      await crashlytics().setAttribute('handled', handled.toString());

      // Add additional context
      if (context.additionalInfo) {
        for (const [key, value] of Object.entries(context.additionalInfo)) {
          await crashlytics().setAttribute(key, String(value));
        }
      }

      // Record error
      if (handled) {
        await crashlytics().recordError(error);
      } else {
        // For unhandled errors, Crashlytics will automatically capture them
        await crashlytics().log(`Unhandled error: ${error.message}`);
      }
    } catch (crashlyticsError) {
      console.error('Error logging to Crashlytics:', crashlyticsError);
    }
  }

  // Show user-friendly error message
  showUserFriendlyError(
    error: Error,
    customMessage?: string,
    showRetry: boolean = false,
    onRetry?: () => void
  ): void {
    const message = customMessage || this.getUserFriendlyMessage(error);
    
    if (showRetry && onRetry) {
      Alert.alert(
        'Bir Hata Oluştu',
        message,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Tekrar Dene', onPress: onRetry },
        ]
      );
    } else {
      Alert.alert('Bir Hata Oluştu', message, [{ text: 'Tamam' }]);
    }
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    }
    
    if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      return 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'Aradığınız içerik bulunamadı.';
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    }
    
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }

  // Retry mechanism with exponential backoff
  async retryOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig = { maxAttempts: 3, delay: 1000 }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry this error
        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          throw lastError;
        }
        
        // Don't wait after the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = config.delay * Math.pow(config.backoffMultiplier || 2, attempt - 1);
        
        // Log retry attempt
        await this.logError(
          lastError,
          { action: 'retry_attempt', additionalInfo: { attempt, delay } },
          'low',
          true
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Log final failure
    await this.logError(
      lastError!,
      { action: 'retry_failed', additionalInfo: { maxAttempts: config.maxAttempts } },
      'high',
      true
    );
    
    throw lastError!;
  }

  // Handle API errors specifically
  async handleApiError(
    error: any,
    context: Omit<ErrorLog['context'], 'action'> = {}
  ): Promise<void> {
    let severity: ErrorLog['severity'] = 'medium';
    let errorMessage = 'API Error';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      errorMessage = `API Error ${status}: ${error.response.data?.message || error.message}`;
      
      if (status >= 500) {
        severity = 'high';
      } else if (status === 401 || status === 403) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network Error: ' + error.message;
      severity = 'medium';
    } else {
      // Other error
      errorMessage = 'Request Error: ' + error.message;
      severity = 'low';
    }
    
    const apiError = new Error(errorMessage);
    apiError.name = 'ApiError';
    
    await this.logError(
      apiError,
      { ...context, action: 'api_request' },
      severity,
      true
    );
  }

  // Handle network errors
  async handleNetworkError(
    error: Error,
    context: Omit<ErrorLog['context'], 'action'> = {}
  ): Promise<void> {
    await this.logError(
      error,
      { ...context, action: 'network_request' },
      'medium',
      true
    );
  }

  // Get error statistics
  async getErrorStatistics(): Promise<{
    totalErrors: number;
    errorsBySeverity: Record<ErrorLog['severity'], number>;
    errorsByType: Record<string, number>;
    recentErrors: ErrorLog[];
  }> {
    const logs = await this.getStoredLogs();
    
    const errorsBySeverity = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorLog['severity'], number>);
    
    const errorsByType = logs.reduce((acc, log) => {
      acc[log.error.name] = (acc[log.error.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentErrors = logs.slice(0, 10);
    
    return {
      totalErrors: logs.length,
      errorsBySeverity,
      errorsByType,
      recentErrors,
    };
  }

  // Store error logs locally
  private async storeErrorLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ERROR_LOGS,
        JSON.stringify(this.errorLogs)
      );
    } catch (error) {
      console.error('Error storing error logs:', error);
    }
  }

  // Load stored error logs
  private async loadStoredLogs(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ERROR_LOGS);
      if (stored) {
        this.errorLogs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored logs:', error);
      this.errorLogs = [];
    }
  }

  // Get stored error logs
  async getStoredLogs(): Promise<ErrorLog[]> {
    return [...this.errorLogs];
  }

  // Clear error logs
  async clearErrorLogs(): Promise<void> {
    try {
      this.errorLogs = [];
      await AsyncStorage.removeItem(STORAGE_KEYS.ERROR_LOGS);
    } catch (error) {
      console.error('Error clearing error logs:', error);
    }
  }

  // Set user context for error tracking
  async setUserContext(userId: string, userInfo?: Record<string, string>): Promise<void> {
    try {
      if (!crashlytics) {
        return;
      }

      await crashlytics().setUserId(userId);
      
      if (userInfo) {
        for (const [key, value] of Object.entries(userInfo)) {
          await crashlytics().setAttribute(key, value);
        }
      }
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }

  // Clear user context
  async clearUserContext(): Promise<void> {
    try {
      if (!crashlytics) {
        return;
      }

      await crashlytics().setUserId('');
    } catch (error) {
      console.error('Error clearing user context:', error);
    }
  }

  // Test crash (for testing purposes only)
  async testCrash(): Promise<void> {
    if (__DEV__ && crashlytics) {
      crashlytics().crash();
    }
  }
}

export const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;