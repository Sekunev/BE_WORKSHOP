import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { ImageOptimization, NetworkOptimization, BatteryOptimization } from '../../utils/performance';
import { buildAccessibilityProps } from '../../utils/accessibility';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  priority?: 'low' | 'normal' | 'high';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showLoadingIndicator?: boolean;
  showErrorFallback?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  fallback,
  resizeMode = 'cover',
  quality = 'auto',
  priority = 'normal',
  accessibilityLabel,
  accessibilityHint,
  testID,
  onLoad,
  onError,
  showLoadingIndicator = true,
  showErrorFallback = true,
  maxWidth = SCREEN_WIDTH,
  maxHeight = SCREEN_WIDTH,
}) => {
  const { theme } = useTheme();
  const { settings } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Determine optimal image quality
  const optimalQuality = useMemo(() => {
    if (quality !== 'auto') return quality;
    
    // Consider battery level and connection type for auto quality
    // In a real app, you would get these from device APIs
    const batteryLevel = 0.8; // Mock battery level
    const connectionType = 'wifi'; // Mock connection type
    
    const batteryQuality = BatteryOptimization.getOptimalImageQuality(batteryLevel);
    const networkQuality = NetworkOptimization.getOptimalImageQualityForConnection(connectionType);
    
    // Use the more conservative quality
    const qualityPriority = { low: 0, medium: 1, high: 2 };
    return qualityPriority[batteryQuality] <= qualityPriority[networkQuality] 
      ? batteryQuality 
      : networkQuality;
  }, [quality]);

  // Generate optimized image URI
  const optimizedSource = useMemo(() => {
    if (typeof source === 'number') {
      return source; // Local image
    }

    if (!source.uri) {
      return source;
    }

    // Calculate optimal dimensions
    const targetWidth = Math.min(maxWidth, SCREEN_WIDTH);
    const targetHeight = Math.min(maxHeight, SCREEN_WIDTH);
    
    const qualityMap = { low: 60, medium: 80, high: 95 };
    const qualityValue = qualityMap[optimalQuality];

    return {
      uri: ImageOptimization.generateResponsiveImageUri(
        source.uri,
        targetWidth,
        targetHeight,
        qualityValue
      ),
    };
  }, [source, maxWidth, maxHeight, optimalQuality]);

  // Handle image load
  const handleLoad = useCallback((event: any) => {
    setLoading(false);
    setError(false);
    
    if (event.nativeEvent?.source) {
      setImageSize({
        width: event.nativeEvent.source.width,
        height: event.nativeEvent.source.height,
      });
    }
    
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((errorEvent: any) => {
    setLoading(false);
    setError(true);
    onError?.(errorEvent);
  }, [onError]);

  // Get image accessibility props
  const imageAccessibilityProps = buildAccessibilityProps({
    role: 'IMAGE',
    label: accessibilityLabel,
    hint: accessibilityHint,
  });

  // Calculate responsive dimensions
  const responsiveDimensions = useMemo(() => {
    if (!style) return {};
    
    const styleObj = StyleSheet.flatten(style);
    const width = styleObj.width as number;
    const height = styleObj.height as number;
    
    if (width && height && settings.preferredFontScale > 1) {
      // Scale image dimensions with font scale for better accessibility
      const scaleFactor = Math.min(settings.preferredFontScale, 1.5);
      return {
        width: width * scaleFactor,
        height: height * scaleFactor,
      };
    }
    
    return {};
  }, [style, settings.preferredFontScale]);

  // Render loading placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, { backgroundColor: theme.colors.surface }]}>
        {showLoadingIndicator && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            {...buildAccessibilityProps({
              label: 'Resim yükleniyor',
              liveRegion: 'polite',
            })}
          />
        )}
      </View>
    );
  };

  // Render error fallback
  const renderErrorFallback = () => {
    if (fallback) {
      return fallback;
    }

    if (!showErrorFallback) {
      return null;
    }

    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          📷
        </Text>
        <Text 
          style={[styles.errorMessage, { color: theme.colors.textSecondary }]}
          {...buildAccessibilityProps({
            role: 'ALERT',
            label: 'Resim yüklenemedi',
          })}
        >
          Resim yüklenemedi
        </Text>
      </View>
    );
  };

  const containerStyles = [
    styles.container,
    containerStyle,
    responsiveDimensions,
  ];

  const imageStyles = [
    style,
    responsiveDimensions,
    {
      opacity: loading ? 0 : 1,
    },
  ];

  return (
    <View style={containerStyles} testID={testID}>
      {/* Loading placeholder */}
      {loading && renderPlaceholder()}
      
      {/* Error fallback */}
      {error && renderErrorFallback()}
      
      {/* Actual image */}
      {!error && (
        <Image
          source={optimizedSource}
          style={imageStyles}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...imageAccessibilityProps}
          // Performance optimizations
          fadeDuration={settings.isReduceMotionEnabled ? 0 : 300}
          progressiveRenderingEnabled={true}
          shouldRasterizeIOS={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    textAlign: 'center',
  },
});