import { Alert } from 'react-native';
import { monitoringService } from '../services/monitoringService';

export interface ErrorHandlingOptions {
  showUserMessage?: boolean;
  customMessage?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    screen?: string;
    action?: string;
    userId?: string;
    additionalInfo?: Record<string, any>;
  };
}

// Main error handling function
export const handleError = async (
  error: Error,
  options: ErrorHandlingOptions = {}
): Promise<void> => {
  const {
    showUserMessage = true,
    customMessage,
    showRetry = false,
    onRetry,
    severity = 'medium',
    context = {},
  } = options;

  try {
    // Log error to monitoring service
    await monitoringService.logError(error, context, severity);

    // Show user-friendly message if requested
    if (showUserMessage) {
      const message = customMessage || getUserFriendlyMessage(error);
      
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
  } catch (loggingError) {
    console.error('Error in error handling:', loggingError);
  }
};

// Get user-friendly error message
export const getUserFriendlyMessage = (error: Error): string => {
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
};

// Retry mechanism with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: Error) => boolean;
    onRetry?: (attempt: number, error: Error) => void;
    context?: ErrorHandlingOptions['context'];
  } = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry,
    onRetry,
    context = {},
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Don't wait after the last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const currentDelay = delay * Math.pow(backoffMultiplier, attempt - 1);
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt, lastError);
      }
      
      // Log retry attempt
      await handleError(lastError, {
        showUserMessage: false,
        severity: 'low',
        context: {
          ...context,
          action: 'retry_attempt',
          additionalInfo: { attempt, delay: currentDelay, maxAttempts },
        },
      });
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  
  // Log final failure
  await handleError(lastError!, {
    showUserMessage: false,
    severity: 'high',
    context: {
      ...context,
      action: 'retry_failed',
      additionalInfo: { maxAttempts },
    },
  });
  
  throw lastError!;
};

// Async error boundary for promises
export const asyncErrorBoundary = async <T>(
  asyncFn: () => Promise<T>,
  options: ErrorHandlingOptions = {}
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    await handleError(error as Error, options);
    return null;
  }
};

// Safe async function wrapper
export const safeAsync = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions = {}
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      await handleError(error as Error, options);
      return null;
    }
  };
};

// Network error handler
export const handleNetworkError = async (
  error: Error,
  options: Omit<ErrorHandlingOptions, 'context'> & {
    context?: Omit<ErrorHandlingOptions['context'], 'action'>;
  } = {}
): Promise<void> => {
  await handleError(error, {
    ...options,
    context: {
      ...options.context,
      action: 'network_request',
    },
  });
};

// API error handler
export const handleApiError = async (
  error: any,
  options: Omit<ErrorHandlingOptions, 'context'> & {
    context?: Omit<ErrorHandlingOptions['context'], 'action'> & {
      method?: string;
      url?: string;
      additionalInfo?: Record<string, any>;
    };
  } = {}
): Promise<void> => {
  let severity: ErrorHandlingOptions['severity'] = 'medium';
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
  
  await handleError(apiError, {
    ...options,
    severity,
    context: {
      ...options.context,
      action: 'api_request',
      additionalInfo: {
        method: options.context?.method,
        url: options.context?.url,
        status: error.response?.status,
        ...options.context?.additionalInfo,
      },
    },
  });
};

// Form validation error handler
export const handleValidationError = async (
  error: Error,
  fieldName?: string,
  options: Omit<ErrorHandlingOptions, 'context'> & {
    context?: Omit<ErrorHandlingOptions['context'], 'action'> & {
      additionalInfo?: Record<string, any>;
    };
  } = {}
): Promise<void> => {
  await handleError(error, {
    ...options,
    severity: 'low',
    context: {
      ...options.context,
      action: 'form_validation',
      additionalInfo: {
        fieldName,
        ...options.context?.additionalInfo,
      },
    },
  });
};

// Storage error handler
export const handleStorageError = async (
  error: Error,
  operation: 'read' | 'write' | 'delete',
  key?: string,
  options: Omit<ErrorHandlingOptions, 'context'> & {
    context?: Omit<ErrorHandlingOptions['context'], 'action'> & {
      additionalInfo?: Record<string, any>;
    };
  } = {}
): Promise<void> => {
  await handleError(error, {
    ...options,
    severity: 'medium',
    context: {
      ...options.context,
      action: 'storage_operation',
      additionalInfo: {
        operation,
        key,
        ...options.context?.additionalInfo,
      },
    },
  });
};

// Navigation error handler
export const handleNavigationError = async (
  error: Error,
  routeName?: string,
  params?: any,
  options: Omit<ErrorHandlingOptions, 'context'> & {
    context?: Omit<ErrorHandlingOptions['context'], 'action'> & {
      additionalInfo?: Record<string, any>;
    };
  } = {}
): Promise<void> => {
  await handleError(error, {
    ...options,
    severity: 'medium',
    context: {
      ...options.context,
      action: 'navigation',
      additionalInfo: {
        routeName,
        params,
        ...options.context?.additionalInfo,
      },
    },
  });
};

// Create error with context
export const createError = (
  message: string,
  name: string = 'AppError',
  cause?: Error
): Error => {
  const error = new Error(message);
  error.name = name;
  if (cause) {
    (error as any).cause = cause;
  }
  return error;
};

// Check if error should be retried
export const shouldRetryError = (error: Error): boolean => {
  const errorMessage = error.message.toLowerCase();
  
  // Retry network errors
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return true;
  }
  
  // Retry timeout errors
  if (errorMessage.includes('timeout')) {
    return true;
  }
  
  // Retry 5xx server errors
  if (errorMessage.includes('500') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('504')) {
    return true;
  }
  
  // Don't retry client errors (4xx)
  if (errorMessage.includes('400') || errorMessage.includes('401') || 
      errorMessage.includes('403') || errorMessage.includes('404')) {
    return false;
  }
  
  return false;
};

// Error severity classifier
export const classifyErrorSeverity = (error: Error): ErrorHandlingOptions['severity'] => {
  const errorMessage = error.message.toLowerCase();
  
  // Critical errors
  if (errorMessage.includes('crash') || errorMessage.includes('fatal')) {
    return 'critical';
  }
  
  // High severity errors
  if (errorMessage.includes('500') || errorMessage.includes('server') ||
      errorMessage.includes('database') || errorMessage.includes('auth')) {
    return 'high';
  }
  
  // Medium severity errors
  if (errorMessage.includes('network') || errorMessage.includes('timeout') ||
      errorMessage.includes('404') || errorMessage.includes('validation')) {
    return 'medium';
  }
  
  // Low severity errors (default)
  return 'low';
};

export default {
  handleError,
  getUserFriendlyMessage,
  retryOperation,
  asyncErrorBoundary,
  safeAsync,
  handleNetworkError,
  handleApiError,
  handleValidationError,
  handleStorageError,
  handleNavigationError,
  createError,
  shouldRetryError,
  classifyErrorSeverity,
};