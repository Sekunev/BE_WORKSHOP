import { useEffect, useState, useCallback } from 'react';
import { AccessibilityInfo, Dimensions } from 'react-native';
import { accessibilityService, AccessibilitySettings } from '../services/accessibilityService';

export interface UseAccessibilityReturn {
  settings: AccessibilitySettings;
  isScreenReaderEnabled: boolean;
  shouldReduceMotion: boolean;
  isHighContrastMode: boolean;
  fontScale: number;
  screenDimensions: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
  announceForAccessibility: (message: string) => void;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => Promise<void>;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    accessibilityService.getSettings()
  );
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  // Subscribe to accessibility settings changes
  useEffect(() => {
    const unsubscribe = accessibilityService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  // Initialize accessibility service
  useEffect(() => {
    accessibilityService.initialize();
  }, []);

  const announceForAccessibility = useCallback((message: string) => {
    accessibilityService.announceForAccessibility(message);
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      await accessibilityService.updateSetting(key, value);
    },
    []
  );

  return {
    settings,
    isScreenReaderEnabled: settings.isScreenReaderEnabled,
    shouldReduceMotion: settings.isReduceMotionEnabled,
    isHighContrastMode: settings.isHighContrastEnabled,
    fontScale: settings.preferredFontScale,
    screenDimensions,
    announceForAccessibility,
    updateSetting,
  };
};

// Hook for responsive design based on accessibility settings
export const useResponsiveDesign = () => {
  const { settings, screenDimensions } = useAccessibility();

  const getResponsiveValue = useCallback(
    (baseValue: number, scaleFactor: number = 1) => {
      return baseValue * settings.preferredFontScale * scaleFactor;
    },
    [settings.preferredFontScale]
  );

  const getResponsiveSpacing = useCallback(
    (baseSpacing: number) => {
      // Increase spacing for better touch targets when font scale is high
      const scaleFactor = settings.preferredFontScale > 1.2 ? 1.2 : 1;
      return baseSpacing * scaleFactor;
    },
    [settings.preferredFontScale]
  );

  const getMinimumTouchTarget = useCallback(() => {
    // Ensure minimum 44pt touch target as per accessibility guidelines
    const baseSize = 44;
    return Math.max(baseSize, baseSize * settings.preferredFontScale);
  }, [settings.preferredFontScale]);

  const isLargeScreen = screenDimensions.width > 768;
  const isTablet = screenDimensions.width > 600;

  return {
    getResponsiveValue,
    getResponsiveSpacing,
    getMinimumTouchTarget,
    isLargeScreen,
    isTablet,
    screenDimensions,
    fontScale: settings.preferredFontScale,
    shouldReduceMotion: settings.isReduceMotionEnabled,
    isHighContrast: settings.isHighContrastEnabled,
  };
};

// Hook for focus management
export const useFocusManagement = () => {
  const { isScreenReaderEnabled } = useAccessibility();

  const setAccessibilityFocus = useCallback(
    (reactTag: number) => {
      if (isScreenReaderEnabled) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    },
    [isScreenReaderEnabled]
  );

  const announceForAccessibility = useCallback(
    (message: string) => {
      if (isScreenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(message);
      }
    },
    [isScreenReaderEnabled]
  );

  return {
    setAccessibilityFocus,
    announceForAccessibility,
    isScreenReaderEnabled,
  };
};

// Hook for gesture accessibility
export const useGestureAccessibility = () => {
  const { shouldReduceMotion, isScreenReaderEnabled } = useAccessibility();

  const createAccessibleGesture = useCallback(
    (gestureConfig: {
      onPress?: () => void;
      onLongPress?: () => void;
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      accessibilityLabel?: string;
      accessibilityHint?: string;
    }) => {
      const accessibilityActions = [];

      if (gestureConfig.onPress) {
        accessibilityActions.push({
          name: 'activate',
          label: gestureConfig.accessibilityLabel || 'Etkinleştir',
        });
      }

      if (gestureConfig.onLongPress) {
        accessibilityActions.push({
          name: 'longpress',
          label: 'Uzun basarak menüyü aç',
        });
      }

      if (gestureConfig.onSwipeLeft) {
        accessibilityActions.push({
          name: 'swipeLeft',
          label: 'Sola kaydırarak sil',
        });
      }

      if (gestureConfig.onSwipeRight) {
        accessibilityActions.push({
          name: 'swipeRight',
          label: 'Sağa kaydırarak işaretle',
        });
      }

      return {
        accessibilityActions,
        accessibilityLabel: gestureConfig.accessibilityLabel,
        accessibilityHint: gestureConfig.accessibilityHint,
        onAccessibilityAction: (event: any) => {
          switch (event.nativeEvent.actionName) {
            case 'activate':
              gestureConfig.onPress?.();
              break;
            case 'longpress':
              gestureConfig.onLongPress?.();
              break;
            case 'swipeLeft':
              gestureConfig.onSwipeLeft?.();
              break;
            case 'swipeRight':
              gestureConfig.onSwipeRight?.();
              break;
          }
        },
      };
    },
    [shouldReduceMotion, isScreenReaderEnabled]
  );

  return {
    createAccessibleGesture,
    shouldReduceMotion,
    isScreenReaderEnabled,
  };
};