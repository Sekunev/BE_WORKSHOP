import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, TYPOGRAPHY, SPACING} from '@/constants/theme';
import {CustomInput, CustomButton} from '@/components/ui';
import {useChangePasswordMutation} from '@/store/api/userApi';
import {ChangePasswordData} from '@/types/user';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [changePassword, {isLoading}] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };



  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      const passwordData: ChangePasswordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      await changePassword(passwordData).unwrap();
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.data?.message || 'Failed to change password'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{width: 24}} />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Icon name="info" size={24} color={COLORS.info} />
        <Text style={styles.infoText}>
          Choose a strong password with at least 6 characters, including letters, numbers, and symbols.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <CustomInput
          label="Current Password"
          value={formData.currentPassword}
          onChangeText={(value) => handleInputChange('currentPassword', value)}
          placeholder="Enter your current password"
          secureTextEntry={true}
          showPasswordToggle={true}
          error={errors.currentPassword}
        />

        <CustomInput
          label="New Password"
          value={formData.newPassword}
          onChangeText={(value) => handleInputChange('newPassword', value)}
          placeholder="Enter your new password"
          secureTextEntry={true}
          showPasswordToggle={true}
          error={errors.newPassword}
        />

        <CustomInput
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Confirm your new password"
          secureTextEntry={true}
          showPasswordToggle={true}
          error={errors.confirmPassword}
        />
      </View>

      {/* Security Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Password Security Tips:</Text>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>Use at least 6 characters</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>Include uppercase and lowercase letters</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>Add numbers and special characters</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>Avoid common words or personal information</Text>
        </View>
      </View>

      {/* Change Password Button */}
      <CustomButton
        title="Change Password"
        onPress={handleChangePassword}
        loading={isLoading}
        style={styles.changeButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}20`,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.xl,
  },

  tipsContainer: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.xl,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  changeButton: {
    marginTop: SPACING.lg,
  },
});

export default ChangePasswordScreen;