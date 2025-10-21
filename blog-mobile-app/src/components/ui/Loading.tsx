import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { buildAccessibilityProps } from '../../utils/accessibility';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const { settings } = useAccessibility();
  const styles = createStyles(theme, settings);

  const loadingColor = color || theme.colors.primary;

  // Create accessibility props
  const accessibilityProps = buildAccessibilityProps({
    label: accessibilityLabel || text || 'Yükleniyor',
    liveRegion: 'polite',
    importantForAccessibility: 'yes',
  });

  const LoadingContent = () => (
    <View 
      style={[styles.container, overlay && styles.overlayContainer]}
      testID={testID}
      {...accessibilityProps}
    >
      <ActivityIndicator size={size} color={loadingColor} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible animationType="fade">
        <View style={styles.modalOverlay}>
          <LoadingContent />
        </View>
      </Modal>
    );
  }

  return <LoadingContent />;
};

const createStyles = (theme: any, settings?: any) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    overlayContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      minWidth: 120,
      minHeight: 120,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      marginTop: 12,
      fontSize: 16 * (settings?.preferredFontScale || 1),
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

export default Loading;