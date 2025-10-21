import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// Device types
export const DEVICE_TYPES = {
  PHONE: 'phone',
  TABLET: 'tablet',
} as const;

// Get device type based on screen width
export const getDeviceType = (): string => {
  return SCREEN_WIDTH < BREAKPOINTS.md ? DEVICE_TYPES.PHONE : DEVICE_TYPES.TABLET;
};

// Check if device is tablet
export const isTablet = (): boolean => {
  return getDeviceType() === DEVICE_TYPES.TABLET;
};

// Check if device is phone
export const isPhone = (): boolean => {
  return getDeviceType() === DEVICE_TYPES.PHONE;
};

// Responsive width based on percentage
export const wp = (percentage: number): number => {
  return (percentage * SCREEN_WIDTH) / 100;
};

// Responsive height based on percentage
export const hp = (percentage: number): number => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

// Responsive font size
export const rf = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base width (iPhone X)
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  const minSize = size * 0.8;
  const maxSize = size * 1.2;
  
  return Math.max(minSize, Math.min(newSize, maxSize));
};

// Scale size based on device pixel ratio
export const scale = (size: number): number => {
  return size * PixelRatio.get();
};

// Moderate scale - less aggressive scaling
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Get responsive spacing
export const getResponsiveSpacing = (baseSpacing: number): number => {
  if (isTablet()) {
    return baseSpacing * 1.2;
  }
  return baseSpacing;
};

// Get responsive font size based on device type
export const getResponsiveFontSize = (baseFontSize: number): number => {
  if (isTablet()) {
    return baseFontSize * 1.1;
  }
  return rf(baseFontSize);
};

// Responsive padding/margin utilities
export const responsiveSize = {
  xs: getResponsiveSpacing(4),
  sm: getResponsiveSpacing(8),
  md: getResponsiveSpacing(16),
  lg: getResponsiveSpacing(24),
  xl: getResponsiveSpacing(32),
  '2xl': getResponsiveSpacing(48),
  '3xl': getResponsiveSpacing(64),
};

// Screen dimension utilities
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375,
  isLargeScreen: SCREEN_WIDTH > 414,
};

// Orientation utilities
export const isLandscape = (): boolean => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

export const isPortrait = (): boolean => {
  return SCREEN_HEIGHT > SCREEN_WIDTH;
};

// Safe area utilities (for devices with notches)
export const getSafeAreaPadding = () => {
  // This would typically use react-native-safe-area-context
  // For now, we'll provide basic padding
  return {
    top: 44, // Status bar height
    bottom: 34, // Home indicator height on newer iPhones
  };
};

// Responsive grid system
export const getGridColumns = (): number => {
  if (isTablet()) {
    return isLandscape() ? 4 : 3;
  }
  return isLandscape() ? 3 : 2;
};

// Responsive card width
export const getCardWidth = (margin: number = 16): number => {
  const columns = getGridColumns();
  const totalMargin = margin * (columns + 1);
  return (SCREEN_WIDTH - totalMargin) / columns;
};

// Responsive modal width
export const getModalWidth = (): number => {
  if (isTablet()) {
    return Math.min(SCREEN_WIDTH * 0.8, 600);
  }
  return SCREEN_WIDTH * 0.9;
};

// Export screen dimensions for easy access
export { SCREEN_WIDTH, SCREEN_HEIGHT };