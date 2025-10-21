import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { AccessibilityHelpers, buildAccessibilityProps } from '../../utils/accessibility';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { theme } = useTheme();
  const { settings, shouldReduceMotion } = useAccessibility();
  const styles = createStyles(theme, settings);

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getLoadingColor = () => {
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.text.inverse;
  };

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

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={shouldReduceMotion ? 1 : theme.opacity.pressed}
      testID={testID}
      {...accessibilityProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, settings?: any) => StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  // Sizes (with accessibility scaling)
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: Math.max(36, 44 * (settings?.preferredFontScale || 1)), // Ensure minimum touch target
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: Math.max(44, 44 * (settings?.preferredFontScale || 1)),
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: Math.max(52, 52 * (settings?.preferredFontScale || 1)),
  },
  
  // Disabled state
  disabled: {
    backgroundColor: theme.colors.text.disabled,
    borderColor: theme.colors.text.disabled,
    opacity: theme.opacity.disabled,
  },
  
  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Text variants
  primaryText: {
    color: theme.colors.text.inverse,
  },
  secondaryText: {
    color: theme.colors.text.inverse,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  
  // Text sizes (with font scaling)
  smallText: {
    fontSize: theme.typography.fontSize.sm * (settings?.preferredFontScale || 1),
  },
  mediumText: {
    fontSize: theme.typography.fontSize.base * (settings?.preferredFontScale || 1),
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg * (settings?.preferredFontScale || 1),
  },
  
  // Disabled text
  disabledText: {
    color: theme.colors.text.disabled,
  },
});

export default CustomButton;