import { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { monitoringService } from '../services/monitoringService';
import { useAuth } from './useAuth';

export interface UseMonitoringOptions {
  screenName?: string;
  trackScreenView?: boolean;
  trackPerformance?: boolean;
}

export const useMonitoring = (options: UseMonitoringOptions = {}) => {
  const { user } = useAuth();
  const screenLoadEndRef = useRef<(() => void) | null>(null);
  const {
    screenName,
    trackScreenView = true,
    trackPerformance = true,
  } = options;

  // Track screen focus and performance
  useFocusEffect(
    useCallback(() => {
      let endMonitoring: (() => void) | null = null;

      const startMonitoring = async () => {
        if (screenName && (trackScreenView || trackPerformance)) {
          try {
            endMonitoring = await monitoringService.monitorScreen(screenName);
            screenLoadEndRef.current = endMonitoring;
          } catch (error) {
            console.error('Error starting screen monitoring:', error);
          }
        }
      };

      startMonitoring();

      return () => {
        if (endMonitoring) {
          endMonitoring();
        }
        screenLoadEndRef.current = null;
      };
    }, [screenName, trackScreenView, trackPerformance])
  );

  // End screen load monitoring when component is fully loaded
  const endScreenLoad = useCallback(() => {
    if (screenLoadEndRef.current) {
      screenLoadEndRef.current();
      screenLoadEndRef.current = null;
    }
  }, []);

  // Log error with context
  const logError = useCallback(async (
    error: Error,
    context: {
      action?: string;
      additionalInfo?: Record<string, any>;
    } = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    try {
      await monitoringService.logError(error, {
        ...context,
        screen: screenName,
        userId: user?.id,
      }, severity);
    } catch (loggingError) {
      console.error('Error logging error:', loggingError);
    }
  }, [screenName, user?.id]);

  // Track event with context
  const trackEvent = useCallback(async (
    event: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      await monitoringService.trackEvent(event, {
        ...properties,
        screen: screenName,
      }, user?.id);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [screenName, user?.id]);

  // Record performance metric
  const recordPerformance = useCallback((
    name: string,
    type: 'screen_load' | 'api_request' | 'image_load' | 'navigation' | 'memory' | 'custom',
    duration?: number,
    additionalInfo?: Record<string, any>
  ) => {
    try {
      monitoringService.recordPerformanceMetric(name, type, duration, {
        screen: screenName,
        userId: user?.id,
        additionalInfo,
      });
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }, [screenName, user?.id]);

  // Monitor API request
  const monitorApiRequest = useCallback(async (
    method: string,
    url: string
  ): Promise<{
    endMonitoring: () => void;
    handleResponse: (status: number, data?: any, error?: Error) => Promise<void>;
  }> => {
    try {
      const endMonitoring = await monitoringService.monitorApiRequest(method, url);
      
      const handleResponse = async (status: number, data?: any, error?: Error) => {
        endMonitoring();
        await monitoringService.handleApiResponse(method, url, status, data, error);
      };

      return { endMonitoring, handleResponse };
    } catch (error) {
      console.error('Error monitoring API request:', error);
      return {
        endMonitoring: () => {},
        handleResponse: async () => {},
      };
    }
  }, []);

  // Track user action
  const trackUserAction = useCallback(async (
    action: string,
    details?: Record<string, any>
  ) => {
    try {
      await trackEvent('user_action', {
        action,
        ...details,
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }, [trackEvent]);

  // Track navigation
  const trackNavigation = useCallback(async (
    from: string,
    to: string,
    params?: any
  ) => {
    try {
      await trackEvent('navigation', {
        from,
        to,
        params,
      });
    } catch (error) {
      console.error('Error tracking navigation:', error);
    }
  }, [trackEvent]);

  return {
    logError,
    trackEvent,
    recordPerformance,
    monitorApiRequest,
    trackUserAction,
    trackNavigation,
    endScreenLoad,
  };
};

// Hook for monitoring API requests specifically
export const useApiMonitoring = () => {
  const { user } = useAuth();

  const monitorRequest = useCallback(async <T>(
    method: string,
    url: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const { endMonitoring, handleResponse } = await monitoringService.monitorApiRequest(method, url);
    
    try {
      const result = await requestFn();
      await handleResponse(200, result);
      return result;
    } catch (error) {
      const status = (error as any)?.response?.status || 500;
      await handleResponse(status, undefined, error as Error);
      throw error;
    }
  }, []);

  return { monitorRequest };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const timers = useRef<Map<string, number>>(new Map());

  const startTiming = useCallback((name: string) => {
    timers.current.set(name, Date.now());
  }, []);

  const endTiming = useCallback((
    name: string,
    type: 'screen_load' | 'api_request' | 'image_load' | 'navigation' | 'memory' | 'custom' = 'custom',
    additionalInfo?: Record<string, any>
  ) => {
    const startTime = timers.current.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      timers.current.delete(name);
      
      monitoringService.recordPerformanceMetric(name, type, duration, {
        additionalInfo,
      });
      
      return duration;
    }
    return null;
  }, []);

  const measureAsync = useCallback(async <T>(
    name: string,
    asyncFn: () => Promise<T>,
    type: 'screen_load' | 'api_request' | 'image_load' | 'navigation' | 'memory' | 'custom' = 'custom',
    additionalInfo?: Record<string, any>
  ): Promise<T> => {
    startTiming(name);
    try {
      const result = await asyncFn();
      endTiming(name, type, additionalInfo);
      return result;
    } catch (error) {
      endTiming(name, type, { ...additionalInfo, error: true });
      throw error;
    }
  }, [startTiming, endTiming]);

  return {
    startTiming,
    endTiming,
    measureAsync,
  };
};

export default useMonitoring;