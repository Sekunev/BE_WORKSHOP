import { InteractionManager, Platform } from 'react-native';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private memoryWarnings: number = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing a performance metric
  startTiming(key: string): void {
    this.metrics.set(key, Date.now());
  }

  // End timing and log the result
  endTiming(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) {
      console.warn(`Performance timing not found for key: ${key}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(key);
    
    if (__DEV__) {
      console.log(`Performance [${key}]: ${duration}ms`);
    }

    return duration;
  }

  // Log memory warning
  logMemoryWarning(): void {
    this.memoryWarnings++;
    if (__DEV__) {
      console.warn(`Memory warning #${this.memoryWarnings}`);
    }
  }

  // Get performance metrics
  getMetrics(): { memoryWarnings: number } {
    return {
      memoryWarnings: this.memoryWarnings,
    };
  }
}

// Image optimization utilities
export const ImageOptimization = {
  // Calculate optimal image dimensions based on screen size and usage
  calculateOptimalDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const qualityMultipliers = {
      low: 0.5,
      medium: 0.75,
      high: 1.0,
    };

    const multiplier = qualityMultipliers[quality];
    const aspectRatio = originalWidth / originalHeight;

    let targetWidth = Math.min(originalWidth, maxWidth) * multiplier;
    let targetHeight = targetWidth / aspectRatio;

    if (targetHeight > maxHeight * multiplier) {
      targetHeight = maxHeight * multiplier;
      targetWidth = targetHeight * aspectRatio;
    }

    return {
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
    };
  },

  // Generate responsive image URI with size parameters
  generateResponsiveImageUri: (
    baseUri: string,
    width: number,
    height: number,
    quality: number = 80
  ): string => {
    if (!baseUri) return '';
    
    // If it's a local image, return as is
    if (baseUri.startsWith('file://') || !baseUri.startsWith('http')) {
      return baseUri;
    }

    // Add query parameters for image resizing (assuming backend supports it)
    const separator = baseUri.includes('?') ? '&' : '?';
    return `${baseUri}${separator}w=${width}&h=${height}&q=${quality}`;
  },

  // Get image cache key
  getCacheKey: (uri: string, width?: number, height?: number): string => {
    const params = width && height ? `_${width}x${height}` : '';
    return `image_${btoa(uri)}${params}`;
  },
};

// Memory management utilities
export const MemoryManagement = {
  // Clean up unused resources
  cleanup: (): void => {
    if (global.gc && __DEV__) {
      global.gc();
    }
  },

  // Run callback after interactions are complete
  runAfterInteractions: (callback: () => void): void => {
    InteractionManager.runAfterInteractions(callback);
  },

  // Debounce function to prevent excessive calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function to limit call frequency
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Bundle optimization utilities
export const BundleOptimization = {
  // Lazy load component
  lazyLoad: <T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> => {
    return React.lazy(importFunc);
  },

  // Preload component for better UX
  preloadComponent: async <T>(
    importFunc: () => Promise<{ default: T }>
  ): Promise<void> => {
    try {
      await importFunc();
    } catch (error) {
      console.warn('Failed to preload component:', error);
    }
  },

  // Check if component should be preloaded based on user behavior
  shouldPreload: (
    userInteractionCount: number,
    componentUsageFrequency: number
  ): boolean => {
    return userInteractionCount > 5 && componentUsageFrequency > 0.3;
  },
};

// Battery optimization utilities
export const BatteryOptimization = {
  // Reduce animation frame rate for battery saving
  getOptimalFrameRate: (batteryLevel?: number): number => {
    if (!batteryLevel) return 60; // Default frame rate
    
    if (batteryLevel < 0.2) return 30; // Low battery
    if (batteryLevel < 0.5) return 45; // Medium battery
    return 60; // High battery
  },

  // Determine if background tasks should be reduced
  shouldReduceBackgroundTasks: (batteryLevel?: number): boolean => {
    return batteryLevel !== undefined && batteryLevel < 0.3;
  },

  // Get optimal image quality based on battery level
  getOptimalImageQuality: (batteryLevel?: number): 'low' | 'medium' | 'high' => {
    if (!batteryLevel) return 'medium';
    
    if (batteryLevel < 0.2) return 'low';
    if (batteryLevel < 0.5) return 'medium';
    return 'high';
  },
};

// Startup optimization utilities
export const StartupOptimization = {
  // Critical resources that should be loaded first
  criticalResources: [
    'theme',
    'authentication',
    'navigation',
  ],

  // Non-critical resources that can be loaded later
  nonCriticalResources: [
    'analytics',
    'notifications',
    'social_features',
  ],

  // Load resources in priority order
  loadResourcesInPriority: async (
    resources: Record<string, () => Promise<void>>
  ): Promise<void> => {
    // Load critical resources first
    for (const resourceName of StartupOptimization.criticalResources) {
      if (resources[resourceName]) {
        try {
          await resources[resourceName]();
        } catch (error) {
          console.error(`Failed to load critical resource ${resourceName}:`, error);
        }
      }
    }

    // Load non-critical resources after interactions
    InteractionManager.runAfterInteractions(async () => {
      for (const resourceName of StartupOptimization.nonCriticalResources) {
        if (resources[resourceName]) {
          try {
            await resources[resourceName]();
          } catch (error) {
            console.warn(`Failed to load non-critical resource ${resourceName}:`, error);
          }
        }
      }
    });
  },

  // Measure app startup time
  measureStartupTime: (): void => {
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.startTiming('app_startup');
    
    // End timing when app is ready
    InteractionManager.runAfterInteractions(() => {
      performanceMonitor.endTiming('app_startup');
    });
  },
};

// List optimization utilities
export const ListOptimization = {
  // Calculate optimal item height for FlatList
  calculateItemHeight: (
    contentHeight: number,
    padding: number = 16,
    margin: number = 8
  ): number => {
    return contentHeight + (padding * 2) + (margin * 2);
  },

  // Get optimal FlatList props for performance
  getOptimalFlatListProps: (itemHeight?: number) => ({
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    initialNumToRender: 5,
    updateCellsBatchingPeriod: 100,
    getItemLayout: itemHeight
      ? (data: any, index: number) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })
      : undefined,
  }),

  // Optimize image rendering in lists
  getOptimalImageProps: () => ({
    resizeMode: 'cover' as const,
    fadeDuration: 0, // Disable fade animation for better performance
    progressiveRenderingEnabled: true,
    shouldRasterizeIOS: true,
  }),
};

// Network optimization utilities
export const NetworkOptimization = {
  // Determine optimal request timeout based on connection
  getOptimalTimeout: (connectionType?: string): number => {
    const timeouts = {
      'wifi': 10000,
      '4g': 15000,
      '3g': 20000,
      '2g': 30000,
      'unknown': 15000,
    };

    return timeouts[connectionType as keyof typeof timeouts] || timeouts.unknown;
  },

  // Determine if request should be cached based on connection
  shouldCacheRequest: (connectionType?: string): boolean => {
    return connectionType !== 'wifi';
  },

  // Get optimal image quality based on connection
  getOptimalImageQualityForConnection: (
    connectionType?: string
  ): 'low' | 'medium' | 'high' => {
    if (connectionType === 'wifi') return 'high';
    if (connectionType === '4g') return 'medium';
    return 'low';
  },
};

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();