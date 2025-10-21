import { AppState, AppStateStatus } from 'react-native';
import { performanceMonitor } from '../utils/performance';

interface MemoryLeakPreventionConfig {
  enableAutoCleanup: boolean;
  cleanupInterval: number; // in milliseconds
  maxMemoryWarnings: number;
  enableAppStateCleanup: boolean;
}

class MemoryLeakPreventionService {
  private static instance: MemoryLeakPreventionService;
  private config: MemoryLeakPreventionConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private activeTimers: Set<NodeJS.Timeout> = new Set();
  private activeIntervals: Set<NodeJS.Timeout> = new Set();
  private activeListeners: Map<string, () => void> = new Map();
  private componentRefs: WeakSet<any> = new WeakSet();

  private constructor() {
    this.config = {
      enableAutoCleanup: true,
      cleanupInterval: 30000, // 30 seconds
      maxMemoryWarnings: 3,
      enableAppStateCleanup: true,
    };
  }

  static getInstance(): MemoryLeakPreventionService {
    if (!MemoryLeakPreventionService.instance) {
      MemoryLeakPreventionService.instance = new MemoryLeakPreventionService();
    }
    return MemoryLeakPreventionService.instance;
  }

  initialize(config?: Partial<MemoryLeakPreventionConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupAutoCleanup();
    this.setupAppStateListener();
    this.setupMemoryWarningListener();
  }

  private setupAutoCleanup(): void {
    if (!this.config.enableAutoCleanup) return;

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  private setupAppStateListener(): void {
    if (!this.config.enableAppStateCleanup) return;

    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  private setupMemoryWarningListener(): void {
    // Listen for memory warnings (iOS specific)
    if (__DEV__) {
      // In development, we can simulate memory warnings
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (args[0]?.includes?.('memory')) {
          performanceMonitor.logMemoryWarning();
          this.handleMemoryWarning();
        }
        originalConsoleWarn(...args);
      };
    }
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'background') {
      this.performCleanup();
    } else if (nextAppState === 'active') {
      // App became active, check if cleanup is needed
      const metrics = performanceMonitor.getMetrics();
      if (metrics.memoryWarnings > this.config.maxMemoryWarnings) {
        this.performAggressiveCleanup();
      }
    }
  }

  private handleMemoryWarning(): void {
    console.warn('Memory warning detected, performing cleanup...');
    this.performAggressiveCleanup();
  }

  // Register a timer to be tracked
  registerTimer(timer: NodeJS.Timeout): NodeJS.Timeout {
    this.activeTimers.add(timer);
    return timer;
  }

  // Register an interval to be tracked
  registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    this.activeIntervals.add(interval);
    return interval;
  }

  // Register an event listener to be tracked
  registerListener(key: string, cleanup: () => void): void {
    this.activeListeners.set(key, cleanup);
  }

  // Register a component reference
  registerComponent(component: any): void {
    this.componentRefs.add(component);
  }

  // Unregister a timer
  unregisterTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.activeTimers.delete(timer);
  }

  // Unregister an interval
  unregisterInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.activeIntervals.delete(interval);
  }

  // Unregister a listener
  unregisterListener(key: string): void {
    const cleanup = this.activeListeners.get(key);
    if (cleanup) {
      cleanup();
      this.activeListeners.delete(key);
    }
  }

  // Perform regular cleanup
  private performCleanup(): void {
    // Clean up completed timers
    this.activeTimers.forEach(timer => {
      // Check if timer is still active (this is a simplified check)
      if (!timer) {
        this.activeTimers.delete(timer);
      }
    });

    // Force garbage collection in development
    if (__DEV__ && global.gc) {
      global.gc();
    }
  }

  // Perform aggressive cleanup during memory pressure
  private performAggressiveCleanup(): void {
    console.log('Performing aggressive memory cleanup...');

    // Clear all active timers
    this.activeTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.activeTimers.clear();

    // Clear all active intervals
    this.activeIntervals.forEach(interval => {
      clearInterval(interval);
    });
    this.activeIntervals.clear();

    // Clean up all registered listeners
    this.activeListeners.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during listener cleanup:', error);
      }
    });
    this.activeListeners.clear();

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  }

  // Create a safe setTimeout that's automatically tracked
  createSafeTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.activeTimers.delete(timer);
    }, delay);
    
    this.registerTimer(timer);
    return timer;
  }

  // Create a safe setInterval that's automatically tracked
  createSafeInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.registerInterval(interval);
    return interval;
  }

  // Create a safe event listener that's automatically tracked
  createSafeListener<T extends (...args: any[]) => void>(
    key: string,
    addEventListener: (callback: T) => () => void,
    callback: T
  ): () => void {
    const unsubscribe = addEventListener(callback);
    this.registerListener(key, unsubscribe);
    
    return () => {
      this.unregisterListener(key);
    };
  }

  // Get memory usage statistics
  getMemoryStats(): {
    activeTimers: number;
    activeIntervals: number;
    activeListeners: number;
    memoryWarnings: number;
  } {
    return {
      activeTimers: this.activeTimers.size,
      activeIntervals: this.activeIntervals.size,
      activeListeners: this.activeListeners.size,
      memoryWarnings: performanceMonitor.getMetrics().memoryWarnings,
    };
  }

  // Cleanup all resources
  cleanup(): void {
    this.performAggressiveCleanup();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// React hook for memory leak prevention
export const useMemoryLeakPrevention = () => {
  const service = MemoryLeakPreventionService.getInstance();

  React.useEffect(() => {
    // Register component
    const componentRef = {};
    service.registerComponent(componentRef);

    // Cleanup on unmount
    return () => {
      // Component-specific cleanup would go here
    };
  }, []);

  return {
    createSafeTimeout: service.createSafeTimeout.bind(service),
    createSafeInterval: service.createSafeInterval.bind(service),
    createSafeListener: service.createSafeListener.bind(service),
    getMemoryStats: service.getMemoryStats.bind(service),
  };
};

// Export singleton instance
export const memoryLeakPrevention = MemoryLeakPreventionService.getInstance();