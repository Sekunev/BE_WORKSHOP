import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useCommonStyles } from '../../constants/commonStyles';
import {
  CustomButton,
  CustomInput,
  Alert,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
} from '../ui';
import { LoadingSpinner } from '../common';

/**
 * Example component demonstrating the usage of the UI Kit components
 * This shows how to use the new theme system and components
 */
const UIKitExample: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const commonStyles = useCommonStyles(theme);

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (inputError) setInputError('');
  };

  const validateInput = () => {
    if (!inputValue.trim()) {
      setInputError('This field is required');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateInput()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showSuccess('Form submitted successfully!');
        setInputValue('');
      }, 2000);
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.paddingMd}>

        {/* Theme Toggle Section */}
        <View style={styles.section}>
          <CustomButton
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            onPress={toggleTheme}
            variant="outline"
          />
        </View>

        {/* Button Examples */}
        <View style={styles.section}>
          <CustomButton
            title="Primary Button"
            onPress={() => showInfo('Primary button pressed')}
            variant="primary"
            style={styles.buttonSpacing}
          />

          <CustomButton
            title="Secondary Button"
            onPress={() => showWarning('Secondary button pressed')}
            variant="secondary"
            size="small"
            style={styles.buttonSpacing}
          />

          <CustomButton
            title="Outline Button"
            onPress={() => showError('Outline button pressed')}
            variant="outline"
            size="large"
            style={styles.buttonSpacing}
          />

          <CustomButton
            title="Loading Button"
            onPress={() => { }}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* Input Examples */}
        <View style={styles.section}>
          <CustomInput
            label="Email Address"
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={inputError}
          />

          <CustomInput
            label="Password"
            value=""
            onChangeText={() => { }}
            placeholder="Enter your password"
            secureTextEntry
            showPasswordToggle
          />

          <CustomInput
            label="Bio"
            value=""
            onChangeText={() => { }}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <CustomButton
            title="Submit Form"
            onPress={handleSubmit}
            loading={loading}
            style={styles.buttonSpacing}
          />

          <CustomButton
            title="Show Alert"
            onPress={() => setShowAlert(true)}
            variant="outline"
          />
        </View>

        {/* Loading Examples */}
        <View style={styles.section}>
          <LoadingSpinner text="Loading content..." />
        </View>

        {/* Skeleton Examples */}
        <View style={styles.section}>
          <SkeletonAvatar size={60} />
          <View style={styles.skeletonSpacing}>
            <SkeletonText lines={2} />
          </View>
          <SkeletonCard />
        </View>

        {/* Alert Component */}
        <Alert
          visible={showAlert}
          title="Confirmation"
          message="Are you sure you want to proceed with this action?"
          type="warning"
          buttons={[
            {
              text: 'Cancel',
              onPress: () => setShowAlert(false),
              style: 'cancel',
            },
            {
              text: 'Confirm',
              onPress: () => {
                setShowAlert(false);
                showSuccess('Action confirmed!');
              },
              style: 'default',
            },
          ]}
          onDismiss={() => setShowAlert(false)}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  buttonSpacing: {
    marginBottom: theme.spacing.md,
  },
  skeletonSpacing: {
    marginVertical: theme.spacing.md,
  },
});

export default UIKitExample;