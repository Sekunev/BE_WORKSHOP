import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AccessibilityHelpers, buildAccessibilityProps } from '../../utils/accessibility';
import { accessibilityService } from '../../services/accessibilityService';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  required = false,
  error,
  disabled = false,
  maxLength,
  style,
  inputStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onFocus,
  onBlur,
}) => {
  const { theme } = useTheme();
  const settings = accessibilityService.getSettings();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Calculate font scale
  const fontScale = settings.preferredFontScale;

  // Create accessibility props for input
  const inputAccessibilityProps = buildAccessibilityProps({
    role: 'TEXT',
    label: accessibilityLabel || AccessibilityHelpers.createFormFieldLabel(label, required, error),
    hint: accessibilityHint || placeholder,
    state: {
      disabled,
    },
  });

  // Get container styles
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: 16,
    };

    return baseStyle;
  };

  // Get label styles
  const getLabelStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16 * fontScale,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.text,
    };

    // High contrast adjustments
    if (settings.isHighContrastEnabled) {
      baseStyle.fontWeight = 'bold';
    }

    // Error state
    if (error) {
      baseStyle.color = theme.colors.error || '#FF0000';
    }

    return baseStyle;
  };

  // Get input container styles
  const getInputContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: multiline ? 12 : 16,
      backgroundColor: theme.colors.surface || theme.colors.background,
      minHeight: 44, // Minimum touch target size
    };

    // Focus state
    if (isFocused) {
      baseStyle.borderColor = theme.colors.primary;
      baseStyle.borderWidth = 2;
    } else if (error) {
      baseStyle.borderColor = theme.colors.error || '#FF0000';
    } else {
      baseStyle.borderColor = theme.colors.border || '#E0E0E0';
    }

    // High contrast mode
    if (settings.isHighContrastEnabled) {
      baseStyle.borderWidth = 2;
      baseStyle.backgroundColor = theme.colors.background;
    }

    // Disabled state
    if (disabled) {
      baseStyle.backgroundColor = theme.colors.disabled || '#F5F5F5';
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  // Get input text styles
  const getInputTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16 * fontScale,
      color: theme.colors.text,
      flex: 1,
    };

    if (multiline) {
      baseStyle.textAlignVertical = 'top';
      baseStyle.minHeight = numberOfLines * 20 * fontScale;
    }

    return baseStyle;
  };

  // Get error text styles
  const getErrorTextStyles = (): TextStyle => {
    return {
      fontSize: 14 * fontScale,
      color: theme.colors.error || '#FF0000',
      marginTop: 4,
      fontWeight: settings.isHighContrastEnabled ? 'bold' : 'normal',
    };
  };

  // Get character count styles
  const getCharacterCountStyles = (): TextStyle => {
    return {
      fontSize: 12 * fontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      textAlign: 'right',
      marginTop: 4,
    };
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    // Announce focus for screen readers
    if (settings.isScreenReaderEnabled) {
      accessibilityService.announceForAccessibility(`${label} alanına odaklandı`);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    
    // Announce password visibility change
    if (settings.isScreenReaderEnabled) {
      accessibilityService.announceForAccessibility(
        showPassword ? 'Şifre gizlendi' : 'Şifre gösteriliyor'
      );
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[getContainerStyles(), style]}>
      {/* Label */}
      <TouchableOpacity onPress={focusInput} activeOpacity={1}>
        <Text style={getLabelStyles()}>
          {label}
          {required && <Text style={{ color: theme.colors.error || '#FF0000' }}> *</Text>}
        </Text>
      </TouchableOpacity>

      {/* Input Container */}
      <View style={getInputContainerStyles()}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[getInputTextStyles(), inputStyle]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary || theme.colors.text}
            secureTextEntry={secureTextEntry && !showPassword}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={!disabled}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID}
            {...inputAccessibilityProps}
          />

          {/* Password Toggle Button */}
          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
              {...buildAccessibilityProps({
                role: 'BUTTON',
                label: showPassword ? 'Şifreyi gizle' : 'Şifreyi göster',
                hint: 'Şifre görünürlüğünü değiştir',
              })}
            >
              <Text style={{ color: theme.colors.primary }}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={getErrorTextStyles()}
          {...buildAccessibilityProps({
            role: 'ALERT',
            liveRegion: 'assertive',
          })}
        >
          {error}
        </Text>
      )}

      {/* Character Count */}
      {maxLength && (
        <Text style={getCharacterCountStyles()}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordToggle: {
    padding: 8,
    marginLeft: 8,
  },
});