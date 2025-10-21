import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import CustomButton from './CustomButton';

export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  type?: 'default' | 'success' | 'warning' | 'error';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
  type = 'default',
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getAlertColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getAlertIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const renderButtons = () => {
    if (buttons.length === 0) {
      return (
        <CustomButton
          title="OK"
          onPress={onDismiss || (() => {})}
          variant="primary"
          style={styles.singleButton}
        />
      );
    }

    if (buttons.length === 1) {
      const button = buttons[0];
      return (
        <CustomButton
          title={button.text}
          onPress={button.onPress}
          variant={button.style === 'destructive' ? 'primary' : 'outline'}
          style={styles.singleButton}
        />
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <CustomButton
            key={index}
            title={button.text}
            onPress={button.onPress}
            variant={
              button.style === 'destructive' 
                ? 'primary' 
                : button.style === 'cancel' 
                ? 'outline' 
                : 'secondary'
            }
            style={[
              styles.multiButton,
              index < buttons.length - 1 && styles.buttonMargin,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity
          style={styles.alertContainer}
          activeOpacity={1}
          onPress={() => {}} // Prevent backdrop press when touching alert
        >
          <View style={[styles.iconContainer, { backgroundColor: getAlertColor() }]}>
            <Text style={styles.icon}>{getAlertIcon()}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
          
          <View style={styles.buttonSection}>
            {renderButtons()}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Static methods for common alert types
export const showAlert = (props: Omit<AlertProps, 'visible'>) => {
  // This would typically be implemented with a global alert context
  // For now, it's just a placeholder
  console.warn('showAlert should be implemented with AlertProvider');
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  showAlert({
    title,
    message,
    buttons: [
      {
        text: 'Cancel',
        onPress: onCancel || (() => {}),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
        style: 'default',
      },
    ],
  });
};

export const showDestructiveAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  showAlert({
    title,
    message,
    type: 'error',
    buttons: [
      {
        text: 'Cancel',
        onPress: onCancel || (() => {}),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: onConfirm,
        style: 'destructive',
      },
    ],
  });
};

const createStyles = (theme: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: `rgba(0, 0, 0, ${theme.opacity.overlay})`,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  alertContainer: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.xl,
    width: Math.min(SCREEN_WIDTH - theme.spacing.lg * 2, 320),
    maxWidth: '100%',
    ...theme.shadows.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -30,
    marginBottom: theme.spacing.md,
  },
  icon: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
  },
  buttonSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  singleButton: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  multiButton: {
    flex: 1,
  },
  buttonMargin: {
    marginRight: theme.spacing.sm,
  },
});

export default Alert;