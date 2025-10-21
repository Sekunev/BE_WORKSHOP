import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOffline } from '@/hooks/useOffline';
import { useTheme } from '@/contexts/ThemeContext';

interface OfflineIndicatorProps {
  showSyncButton?: boolean;
  onSyncPress?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showSyncButton = true,
  onSyncPress,
}) => {
  const { isOffline, syncStatus, syncPendingData } = useOffline();
  const { theme } = useTheme();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isOffline) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, fadeAnim]);

  const handleSyncPress = async () => {
    if (onSyncPress) {
      onSyncPress();
    } else {
      await syncPendingData();
    }
  };

  if (!isOffline && syncStatus.pendingActions === 0 && syncStatus.pendingDrafts === 0) {
    return null;
  }

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Icon
          name={isOffline ? 'cloud-off' : 'cloud-sync'}
          size={20}
          color={isOffline ? theme.colors.error : theme.colors.warning}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOffline ? 'Çevrimdışı' : 'Senkronizasyon Bekleniyor'}
          </Text>
          
          {(syncStatus.pendingActions > 0 || syncStatus.pendingDrafts > 0) && (
            <Text style={styles.subtitle}>
              {syncStatus.pendingActions > 0 && `${syncStatus.pendingActions} işlem`}
              {syncStatus.pendingActions > 0 && syncStatus.pendingDrafts > 0 && ', '}
              {syncStatus.pendingDrafts > 0 && `${syncStatus.pendingDrafts} taslak`}
              {' bekliyor'}
            </Text>
          )}
        </View>

        {showSyncButton && !isOffline && (syncStatus.pendingActions > 0 || syncStatus.pendingDrafts > 0) && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncPress}
            activeOpacity={0.7}
          >
            <Icon name="sync" size={18} color={theme.colors.primary} />
            <Text style={styles.syncButtonText}>Senkronize Et</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    syncButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    syncButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: 4,
    },
  });