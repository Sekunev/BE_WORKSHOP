import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { debugLoggingService } from './debugLoggingService';
import { analyticsService } from './analyticsService';

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'screen_load' | 'api_request' | 'image_load' | 'navigation' | 'memory' | 'custom';
  name: string;
  duration?: number;
  value?: number;
  unit?: string;
  context: {
    userId?: string;
    screen?: string;
    additionalInfo?: Record<string, any>;
  };
}

export interface MemoryUsage {
  timestamp: string;
  jsHeapSizeUsed: number;
  jsHeapSizeTotal: number;
  jsHeapSizeLimit: number;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private maxStoredMetrics = 500;
  private memoryCheckInterval: NodeJS.Timeout | null = null;

  // Initialize performance monitoring
  async initialize(): Promise<void> {
    try {
      // Load stored metrics
      await this.loadStoredMetrics();
      
      // Start memory monitoring in development
      if (__DEV__) {
        this.startMemoryMonitoring();
      }
      
      debugLoggingService.info('Performance', 'Performance monitoring service initialized');
    } catch (error) {
      debugLoggingService.error('Performance', 'Error initializing performance monitoring service', error);
    }
  }

  // Start timing a performance metric
  startTiming(name: string): void {
    this.timers.set(name, Date.now());
    debugLoggingService.debug('Performance', `Started timing: ${name}`);
  }

  // End timing and record metric
  endTiming(
    name: string,
    type: PerformanceMetric['type'] = 'custom',
    context: PerformanceMetric['context'] = {}
  ): number | null {
    const startTime = this.timers.get(name);
    if (!startTime) {
      debugLoggingService.warn('Performance', `No start time found for: ${name}`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      type,
      name,
      duration,
      unit: 'ms',
      context,
    });

    debugLoggingService.debug('Performance', `Ended timing: ${name} - ${duration}ms`);
    return duration;
  }

  // Record a performance metric
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...metric,
    };

    // Add to metrics array
    this.metrics.unshift(performanceMetric);

    // Keep only max stored metrics
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(0, this.maxStoredMetrics);
    }

    // Store metrics asynchronously
    this.storeMetricsAsync();

    // Log performance metric
    debugLoggingService.logPerformance(
      metric.name,
      metric.duration || metric.value || 0,
      metric.unit || '',
      metric.context
    );

    // Track in analytics for important metrics
    if (this.shouldTrackInAnalytics(metric)) {
      analyticsService.trackEvent('performance_metric', {
        metricType: metric.type,
        metricName: metric.name,
        duration: metric.duration,
        value: metric.value,
        unit: metric.unit,
      }, metric.context.userId);
    }
  }

  // Check if metric should be tracked in analytics
  private shouldTrackInAnalytics(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): boolean {
    // Track screen loads and API requests that are slow
    if (metric.type === 'screen_load' && metric.duration && metric.duration > 2000) {
      return true;
    }
    
    if (metric.type === 'api_request' && metric.duration && metric.duration > 5000) {
      return true;
    }

    return false;
  }

  // Monitor screen load performance
  async monitorScreenLoad(screenName: string, context: PerformanceMetric['context'] = {}): Promise<() => void> {
    const timerName = `screen_load_${screenName}`;
    this.startTiming(timerName);

    return () => {
      this.endTiming(timerName, 'screen_load', {
        ...context,
        screen: screenName,
      });
    };
  }

  // Monitor API request performance
  async monitorApiRequest(
    method: string,
    url: string,
    context: PerformanceMetric['context'] = {}
  ): Promise<() => void> {
    const timerName = `api_${method}_${url}`;
    this.startTiming(timerName);

    return () => {
      this.endTiming(timerName, 'api_request', {
        ...context,
        additionalInfo: { method, url },
      });
    };
  }

  // Monitor image load performance
  async monitorImageLoad(imageUri: string, context: PerformanceMetric['context'] = {}): Promise<() => void> {
    const timerName = `image_load_${Date.now()}`;
    this.startTiming(timerName);

    return () => {
      this.endTiming(timerName, 'image_load', {
        ...context,
        additionalInfo: { imageUri },
      });
    };
  }

  // Monitor navigation performance
  async monitorNavigation(
    from: string,
    to: string,
    context: PerformanceMetric['context'] = {}
  ): Promise<() => void> {
    const timerName = `navigation_${from}_to_${to}`;
    this.startTiming(timerName);

    return () => {
      this.endTiming(timerName, 'navigation', {
        ...context,
        additionalInfo: { from, to },
      });
    };
  }

  // Start memory monitoring
  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  // Stop memory monitoring
  stopMemoryMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }

  // Check memory usage
  private checkMemoryUsage(): void {
    try {
      // Note: React Native doesn't have direct access to memory info like web browsers
      // This is a placeholder for memory monitoring that could be implemented with native modules
      const memoryInfo = {
        jsHeapSizeUsed: 0, // Would need native module to get actual values
        jsHeapSizeTotal: 0,
        jsHeapSizeLimit: 0,
      };

      this.recordMetric({
        type: 'memory',
        name: 'js_heap_usage',
        value: memoryInfo.jsHeapSizeUsed,
        unit: 'bytes',
        context: {
          additionalInfo: memoryInfo,
        },
      });

      // Log warning if memory usage is high (placeholder logic)
      if (memoryInfo.jsHeapSizeUsed > memoryInfo.jsHeapSizeLimit * 0.8) {
        debugLoggingService.warn('Performance', 'High memory usage detected', memoryInfo);
      }
    } catch (error) {
      debugLoggingService.error('Performance', 'Error checking memory usage', error);
    }
  }

  // Get performance statistics
  async getPerformanceStatistics(): Promise<{
    totalMetrics: number;
    metricsByType: Record<PerformanceMetric['type'], number>;
    averageDurations: Record<string, number>;
    slowestOperations: PerformanceMetric[];
    recentMetrics: PerformanceMetric[];
  }> {
    const metricsByType = this.metrics.reduce((acc, metric) => {
      acc[metric.type] = (acc[metric.type] || 0) + 1;
      return acc;
    }, {} as Record<PerformanceMetric['type'], number>);

    // Calculate average durations by metric name
    const durationsByName: Record<string, number[]> = {};
    this.metrics.forEach(metric => {
      if (metric.duration) {
        if (!durationsByName[metric.name]) {
          durationsByName[metric.name] = [];
        }
        durationsByName[metric.name].push(metric.duration);
      }
    });

    const averageDurations: Record<string, number> = {};
    Object.entries(durationsByName).forEach(([name, durations]) => {
      averageDurations[name] = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    });

    // Get slowest operations
    const slowestOperations = this.metrics
      .filter(metric => metric.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);

    const recentMetrics = this.metrics.slice(0, 20);

    return {
      totalMetrics: this.metrics.length,
      metricsByType,
      averageDurations,
      slowestOperations,
      recentMetrics,
    };
  }

  // Get metrics by type
  async getMetricsByType(type: PerformanceMetric['type']): Promise<PerformanceMetric[]> {
    return this.metrics.filter(metric => metric.type === type);
  }

  // Get metrics in date range
  async getMetricsInDateRange(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    return this.metrics.filter(metric => {
      const metricDate = new Date(metric.timestamp);
      return metricDate >= startDate && metricDate <= endDate;
    });
  }

  // Get slow operations (above threshold)
  async getSlowOperations(thresholdMs: number = 2000): Promise<PerformanceMetric[]> {
    return this.metrics.filter(metric => 
      metric.duration && metric.duration > thresholdMs
    );
  }

  // Store metrics asynchronously
  private async storeMetricsAsync(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCE_METRICS, JSON.stringify(this.metrics));
    } catch (error) {
      debugLoggingService.error('Performance', 'Error storing performance metrics', error);
    }
  }

  // Load stored metrics
  private async loadStoredMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERFORMANCE_METRICS);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      debugLoggingService.error('Performance', 'Error loading stored metrics', error);
      this.metrics = [];
    }
  }

  // Clear all metrics
  async clearMetrics(): Promise<void> {
    try {
      this.metrics = [];
      await AsyncStorage.removeItem(STORAGE_KEYS.PERFORMANCE_METRICS);
      debugLoggingService.info('Performance', 'Performance metrics cleared');
    } catch (error) {
      debugLoggingService.error('Performance', 'Error clearing performance metrics', error);
    }
  }

  // Export metrics for analysis
  async exportMetrics(): Promise<string> {
    try {
      const statistics = await this.getPerformanceStatistics();
      const exportData = {
        exportDate: new Date().toISOString(),
        statistics,
        metrics: this.metrics,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      debugLoggingService.error('Performance', 'Error exporting metrics', error);
      return '';
    }
  }

  // Cleanup resources
  cleanup(): void {
    this.stopMemoryMonitoring();
    this.timers.clear();
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;