import { errorHandlingService } from './errorHandlingService';
import { debugLoggingService } from './debugLoggingService';
import { performanceMonitoringService } from './performanceMonitoringService';
import { analyticsService } from './analyticsService';
// Import crashlytics conditionally
let crashlytics: any = null;
try {
  crashlytics = require('@react-native-firebase/crashlytics').default;
} catch (error) {
  console.warn('Firebase Crashlytics not available:', error);
  // Crashlytics not available
}
import { AppState, AppStateStatus } from 'react-native';

export interface MonitoringConfig {
  enableErrorHandling: boolean;
  enableDebugLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  enableCrashlytics: boolean;
}

class MonitoringService {
  private config: MonitoringConfig = {
    enableErrorHandling: true,
    enableDebugLogging: __DEV__,
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
    enableCrashlytics: false, // Disabled until Firebase is configured
  };

  private appStateSubscription: any = null;
  private currentUserId: string | null = null;

  // Initialize all monitoring services
  async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    try {
      // Update config
      this.config = { ...this.config, ...config };

      // Initialize error handling service
      if (this.config.enableErrorHandling) {
        await errorHandlingService.initialize();
      }

      // Initialize debug logging service
      if (this.config.enableDebugLogging) {
        await debugLoggingService.initialize();
      }

      // Initialize performance monitoring service
      if (this.config.enablePerformanceMonitoring) {
        await performanceMonitoringService.initialize();
      }

      // Initialize analytics service
      if (this.config.enableAnalytics) {
        await analyticsService.initialize();
      }

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      debugLoggingService.info('Monitoring', 'All monitoring services initialized', this.config);
    } catch (error) {
      console.error('Error initializing monitoring services:', error);
    }
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle React Native errors if ErrorUtils is available
    if (typeof (global as any).ErrorUtils !== 'undefined') {
      const originalHandler = (global as any).ErrorUtils?.getGlobalHandler();
      
      (global as any).ErrorUtils?.setGlobalHandler((error: Error, isFatal: boolean) => {
        if (this.config.enableErrorHandling) {
          errorHandlingService.logError(
            error,
            { additionalInfo: { isFatal, source: 'global_handler' } },
            isFatal ? 'critical' : 'high',
            false
          );
        }

        // Call original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Handle unhandled promise rejections
    if (typeof global.addEventListener === 'function') {
      global.addEventListener('unhandledrejection', (event: any) => {
        if (this.config.enableErrorHandling) {
          const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
          errorHandlingService.logError(
            error,
            { additionalInfo: { source: 'unhandled_promise_rejection' } },
            'high',
            false
          );
        }
      });
    }
  }

  // Set up app state monitoring
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (this.config.enableAnalytics) {
        if (nextAppState === 'active') {
          analyticsService.trackAppOpen(this.currentUserId || undefined);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          analyticsService.trackAppClose(this.currentUserId || undefined);
        }
      }

      if (this.config.enableDebugLogging) {
        debugLoggingService.info('AppState', `App state changed to: ${nextAppState}`, {
          userId: this.currentUserId,
        });
      }
    });
  }

  // Set user context for all monitoring services
  async setUserContext(userId: string, userInfo?: Record<string, string>): Promise<void> {
    this.currentUserId = userId;

    try {
      if (this.config.enableErrorHandling) {
        await errorHandlingService.setUserContext(userId, userInfo);
      }

      if (this.config.enableAnalytics) {
        await analyticsService.initialize(userId);
      }

      debugLoggingService.info('Monitoring', 'User context set', { userId, userInfo });
    } catch (error) {
      debugLoggingService.error('Monitoring', 'Error setting user context', error);
    }
  }

  // Clear user context
  async clearUserContext(): Promise<void> {
    const previousUserId = this.currentUserId;
    this.currentUserId = null;

    try {
      if (this.config.enableErrorHandling) {
        await errorHandlingService.clearUserContext();
      }

      debugLoggingService.info('Monitoring', 'User context cleared', { previousUserId });
    } catch (error) {
      debugLoggingService.error('Monitoring', 'Error clearing user context', error);
    }
  }

  // Log error with all monitoring services
  async logError(
    error: Error,
    context: {
      screen?: string;
      action?: string;
      userId?: string;
      additionalInfo?: Record<string, any>;
    } = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const enrichedContext = {
      ...context,
      userId: context.userId || this.currentUserId || undefined,
    };

    if (this.config.enableErrorHandling) {
      await errorHandlingService.logError(error, enrichedContext, severity, true);
    }

    if (this.config.enableDebugLogging) {
      debugLoggingService.error('Error', error.message, {
        error: error.stack,
        context: enrichedContext,
        severity,
      });
    }
  }

  // Track performance metric
  recordPerformanceMetric(
    name: string,
    type: 'screen_load' | 'api_request' | 'image_load' | 'navigation' | 'memory' | 'custom',
    duration?: number,
    context: {
      screen?: string;
      userId?: string;
      additionalInfo?: Record<string, any>;
    } = {}
  ): void {
    if (this.config.enablePerformanceMonitoring) {
      const enrichedContext = {
        ...context,
        userId: context.userId || this.currentUserId || undefined,
      };

      performanceMonitoringService.recordMetric({
        type,
        name,
        duration,
        unit: duration ? 'ms' : undefined,
        context: enrichedContext,
      });
    }
  }

  // Track analytics event
  async trackEvent(
    event: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    if (this.config.enableAnalytics) {
      await analyticsService.trackEvent(
        event,
        properties,
        userId || this.currentUserId || undefined
      );
    }
  }

  // Monitor screen performance
  async monitorScreen(screenName: string): Promise<() => void> {
    const endPerformanceMonitoring = this.config.enablePerformanceMonitoring
      ? await performanceMonitoringService.monitorScreenLoad(screenName, {
          userId: this.currentUserId || undefined,
        })
      : () => {};

    // Track screen view in analytics
    if (this.config.enableAnalytics) {
      await analyticsService.trackScreenView(screenName, this.currentUserId || undefined);
    }

    return endPerformanceMonitoring;
  }

  // Monitor API request
  async monitorApiRequest(method: string, url: string): Promise<() => void> {
    const endPerformanceMonitoring = this.config.enablePerformanceMonitoring
      ? await performanceMonitoringService.monitorApiRequest(method, url, {
          userId: this.currentUserId || undefined,
        })
      : () => {};

    // Log API request
    if (this.config.enableDebugLogging) {
      debugLoggingService.logApiRequest(method, url, undefined, {
        userId: this.currentUserId || undefined,
      });
    }

    return endPerformanceMonitoring;
  }

  // Handle API response
  async handleApiResponse(
    method: string,
    url: string,
    status: number,
    data?: any,
    error?: Error
  ): Promise<void> {
    // Log API response
    if (this.config.enableDebugLogging) {
      debugLoggingService.logApiResponse(method, url, status, data, {
        userId: this.currentUserId || undefined,
      });
    }

    // Handle API errors
    if (error && this.config.enableErrorHandling) {
      await errorHandlingService.handleApiError(error, {
        userId: this.currentUserId || undefined,
        additionalInfo: { method, url, status },
      });
    }
  }

  // Get comprehensive monitoring report
  async getMonitoringReport(): Promise<{
    errorStatistics: any;
    performanceStatistics: any;
    logStatistics: any;
    analyticsData: any;
  }> {
    const [errorStatistics, performanceStatistics, logStatistics, analyticsData] = await Promise.all([
      this.config.enableErrorHandling ? errorHandlingService.getErrorStatistics() : null,
      this.config.enablePerformanceMonitoring ? performanceMonitoringService.getPerformanceStatistics() : null,
      this.config.enableDebugLogging ? debugLoggingService.getLogStatistics() : null,
      this.config.enableAnalytics && this.currentUserId 
        ? analyticsService.exportAnalyticsData(this.currentUserId) 
        : null,
    ]);

    return {
      errorStatistics,
      performanceStatistics,
      logStatistics,
      analyticsData,
    };
  }

  // Clear all monitoring data
  async clearAllData(): Promise<void> {
    try {
      if (this.config.enableErrorHandling) {
        await errorHandlingService.clearErrorLogs();
      }

      if (this.config.enablePerformanceMonitoring) {
        await performanceMonitoringService.clearMetrics();
      }

      if (this.config.enableDebugLogging) {
        await debugLoggingService.clearLogs();
      }

      if (this.config.enableAnalytics && this.currentUserId) {
        await analyticsService.clearAnalyticsData(this.currentUserId);
      }

      debugLoggingService.info('Monitoring', 'All monitoring data cleared');
    } catch (error) {
      debugLoggingService.error('Monitoring', 'Error clearing monitoring data', error);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update individual service configurations
    if (this.config.enableDebugLogging) {
      debugLoggingService.setEnabled(true);
    } else {
      debugLoggingService.setEnabled(false);
    }

    debugLoggingService.info('Monitoring', 'Configuration updated', this.config);
  }

  // Get current configuration
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  // Cleanup resources
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.config.enablePerformanceMonitoring) {
      performanceMonitoringService.cleanup();
    }

    debugLoggingService.info('Monitoring', 'Monitoring service cleaned up');
  }

  // Test error reporting (development only)
  async testErrorReporting(): Promise<void> {
    if (__DEV__) {
      try {
        // Test handled error
        const testError = new Error('Test error for monitoring system');
        await this.logError(testError, {
          screen: 'TestScreen',
          action: 'test_error_reporting',
          additionalInfo: { testType: 'handled_error' },
        }, 'low');

        // Test performance metric
        this.recordPerformanceMetric('test_operation', 'custom', 1500, {
          additionalInfo: { testType: 'performance_metric' },
        });

        // Test analytics event
        await this.trackEvent('test_event', {
          testType: 'analytics_event',
          timestamp: new Date().toISOString(),
        });

        debugLoggingService.info('Monitoring', 'Error reporting test completed');
      } catch (error) {
        debugLoggingService.error('Monitoring', 'Error in test error reporting', error);
      }
    }
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;