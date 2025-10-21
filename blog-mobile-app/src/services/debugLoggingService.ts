import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  screen?: string;
}

class DebugLoggingService {
  private logs: LogEntry[] = [];
  private maxStoredLogs = 100; // Reduced to prevent database issues
  private isEnabled = __DEV__;

  // Initialize logging service
  async initialize(): Promise<void> {
    try {
      // Load stored logs
      await this.loadStoredLogs();
      
      // Override console methods in development
      if (__DEV__) {
        this.overrideConsoleMethods();
      }
      
      console.log('Debug logging service initialized');
    } catch (error) {
      console.error('Error initializing debug logging service:', error);
    }
  }

  // Enable/disable logging
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Log debug message
  debug(category: string, message: string, data?: any, context?: { userId?: string; screen?: string }): void {
    this.log('debug', category, message, data, context);
  }

  // Log info message
  info(category: string, message: string, data?: any, context?: { userId?: string; screen?: string }): void {
    this.log('info', category, message, data, context);
  }

  // Log warning message
  warn(category: string, message: string, data?: any, context?: { userId?: string; screen?: string }): void {
    this.log('warn', category, message, data, context);
  }

  // Log error message
  error(category: string, message: string, data?: any, context?: { userId?: string; screen?: string }): void {
    this.log('error', category, message, data, context);
  }

  // Generic log method
  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    context?: { userId?: string; screen?: string }
  ): void {
    if (!this.isEnabled) return;

    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      userId: context?.userId,
      screen: context?.screen,
    };

    // Add to logs array
    this.logs.unshift(logEntry);

    // Keep only max stored logs
    if (this.logs.length > this.maxStoredLogs) {
      this.logs = this.logs.slice(0, this.maxStoredLogs);
    }

    // Store logs asynchronously
    this.storeLogsAsync();

    // Console output with formatting
    this.outputToConsole(logEntry);
  }

  // Output formatted log to console
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category}]`;
    
    const contextInfo = [];
    if (logEntry.screen) contextInfo.push(`Screen: ${logEntry.screen}`);
    if (logEntry.userId) contextInfo.push(`User: ${logEntry.userId}`);
    
    const contextStr = contextInfo.length > 0 ? ` (${contextInfo.join(', ')})` : '';
    const fullMessage = `${prefix}${contextStr} ${logEntry.message}`;

    switch (logEntry.level) {
      case 'debug':
        console.log(fullMessage, logEntry.data || '');
        break;
      case 'info':
        console.info(fullMessage, logEntry.data || '');
        break;
      case 'warn':
        console.warn(fullMessage, logEntry.data || '');
        break;
      case 'error':
        console.error(fullMessage, logEntry.data || '');
        break;
    }
  }

  // Override console methods to capture all logs
  private overrideConsoleMethods(): void {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    console.log = (...args) => {
      this.log('debug', 'console', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
      originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.log('info', 'console', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
      originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.log('warn', 'console', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.log('error', 'console', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
      originalConsole.error(...args);
    };
  }

  // Sanitize data for logging (remove sensitive information)
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'key', 'authorization'];
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Store logs asynchronously
  private async storeLogsAsync(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEBUG_LOGS, JSON.stringify(this.logs));
    } catch (error) {
      // Don't log this error to avoid infinite loop
      console.error('Error storing debug logs:', error);
    }
  }

  // Load stored logs
  private async loadStoredLogs(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DEBUG_LOGS);
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        // Limit loaded logs to prevent cursor window issues
        this.logs = Array.isArray(parsedLogs) ? parsedLogs.slice(0, this.maxStoredLogs) : [];
      }
    } catch (error) {
      console.error('Error loading stored logs:', error);
      // Clear corrupted logs
      await AsyncStorage.removeItem(STORAGE_KEYS.DEBUG_LOGS);
      this.logs = [];
    }
  }

  // Get logs by level
  async getLogsByLevel(level: LogLevel): Promise<LogEntry[]> {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by category
  async getLogsByCategory(category: string): Promise<LogEntry[]> {
    return this.logs.filter(log => log.category === category);
  }

  // Get logs in date range
  async getLogsInDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Get recent logs
  async getRecentLogs(count: number = 100): Promise<LogEntry[]> {
    return this.logs.slice(0, count);
  }

  // Search logs
  async searchLogs(query: string): Promise<LogEntry[]> {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      log.category.toLowerCase().includes(lowerQuery) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(lowerQuery))
    );
  }

  // Get log statistics
  async getLogStatistics(): Promise<{
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    recentActivity: LogEntry[];
  }> {
    const logsByLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const logsByCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = this.logs.slice(0, 20);

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      logsByCategory,
      recentActivity,
    };
  }

  // Export logs for debugging
  async exportLogs(): Promise<string> {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalLogs: this.logs.length,
        logs: this.logs,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting logs:', error);
      return '';
    }
  }

  // Clear all logs
  async clearLogs(): Promise<void> {
    try {
      this.logs = [];
      await AsyncStorage.removeItem(STORAGE_KEYS.DEBUG_LOGS);
      console.log('Debug logs cleared');
    } catch (error) {
      console.error('Error clearing debug logs:', error);
    }
  }

  // Log API request
  logApiRequest(method: string, url: string, data?: any, context?: { userId?: string; screen?: string }): void {
    this.info('API', `${method.toUpperCase()} ${url}`, { requestData: data }, context);
  }

  // Log API response
  logApiResponse(method: string, url: string, status: number, data?: any, context?: { userId?: string; screen?: string }): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.log(level, 'API', `${method.toUpperCase()} ${url} - ${status}`, { responseData: data }, context);
  }

  // Log navigation
  logNavigation(from: string, to: string, params?: any, context?: { userId?: string }): void {
    this.info('Navigation', `${from} -> ${to}`, { params }, context);
  }

  // Log user action
  logUserAction(action: string, details?: any, context?: { userId?: string; screen?: string }): void {
    this.info('UserAction', action, details, context);
  }

  // Log performance metric
  logPerformance(metric: string, value: number, unit: string, context?: { userId?: string; screen?: string }): void {
    this.info('Performance', `${metric}: ${value}${unit}`, { metric, value, unit }, context);
  }

  // Log cache operation
  logCacheOperation(operation: string, key: string, success: boolean, context?: { userId?: string; screen?: string }): void {
    const level = success ? 'debug' : 'warn';
    this.log(level, 'Cache', `${operation} ${key} - ${success ? 'success' : 'failed'}`, { operation, key, success }, context);
  }
}

export const debugLoggingService = new DebugLoggingService();
export default debugLoggingService;