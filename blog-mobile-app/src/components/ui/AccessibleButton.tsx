import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AccessibilityHelpers, buildAccessibilityProps } from '../../utils/accessibility';
import { accessibilityService } from '../../services/accessibilityService';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { theme } = useTheme();
  const settings = accessibilityService.getSettings();

  // Calculate font scale
  const fontScale = settings.preferredFontScale;
  const shouldReduceMotion = settings.isReduceMotionEnabled;

  // Create accessibility props
  const accessibilityProps = buildAccessibilityProps({
    role: 'BUTTON',
    label: accessibilityLabel || AccessibilityHelpers.createButtonLabel(title, { loading, disabled }),
    hint: accessibilityHint || (loading ? 'Lütfen bekleyin' : 'Dokunarak etkinleştirin'),
    state: {
      disabled: disabled || loading,
      busy: loading,
    },
  });

  // Get button styles based on variant and theme
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // Minimum touch target size for accessibility
      opacity: disabled ? 0.6 : 1,
    };

    // High contrast mode adjustments
    if (settings.isHighContrastEnabled) {
      baseStyle.borderWidth = 2;
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          borderColor: settings.isHighContrastEnabled ? theme.colors.text : 'transparent',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary,
          borderColor: settings.isHighContrastEnabled ? theme.colors.text : 'transparent',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: settings.isHighContrastEnabled ? theme.colors.text : 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  // Get text styles
  const getTextStyles = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: (size === 'small' ? 14 : size === 'large' ? 18 : 16) * fontScale,
      fontWeight: '600',
      textAlign: 'center',
    };

    // High contrast text color
    if (settings.isHighContrastEnabled) {
      baseTextStyle.color = variant === 'outline' || variant === 'ghost' 
        ? theme.colors.text 
        : theme.colors.background;
    } else {
      switch (variant) {
        case 'primary':
        case 'secondary':
          baseTextStyle.color = theme.colors.background;
          break;
        case 'outline':
        case 'ghost':
          baseTextStyle.color = theme.colors.primary;
          break;
      }
    }

    return baseTextStyle;
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Provide haptic feedback if not in reduce motion mode
      if (!shouldReduceMotion) {
        // Add haptic feedback here if needed
      }
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.background}
            style={styles.loadingIndicator}
          />
          <Text style={[getTextStyles(), textStyle, { marginLeft: 8 }]}>
            Yükleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={shouldReduceMotion ? 1 : 0.7}
      testID={testID}
      {...accessibilityProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});