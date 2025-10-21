import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOffline } from '@/hooks/useOffline';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SyncStatusProps {
  showDetails?: boolean;
  onRefresh?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  showDetails = false,
  onRefresh,
}) => {
  const {
    isOffline,
    networkState,
    syncStatus,
    syncPendingData,
    drafts,
    clearOfflineData,
  } = useOffline();
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    if (isOffline) return;
    
    setIsSyncing(true);
    try {
      await syncPendingData();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearOfflineData = () => {
    clearOfflineData();
  };

  const getConnectionStatusText = () => {
    if (!networkState.isConnected) {
      return 'İnternet bağlantısı yok';
    }
    if (!networkState.isInternetReachable) {
      return 'İnternet erişimi yok';
    }
    return `Bağlı (${networkState.type})`;
  };

  const getConnectionStatusColor = () => {
    if (isOffline) {
      return theme.colors.error;
    }
    return theme.colors.success;
  };

  const getLastSyncText = () => {
    if (syncStatus.lastSyncTime === 0) {
      return 'Henüz senkronize edilmedi';
    }
    
    try {
      return formatDistanceToNow(new Date(syncStatus.lastSyncTime), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return 'Bilinmeyen zaman';
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {/* Connection Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon
            name={isOffline ? 'cloud-off' : 'cloud-done'}
            size={24}
            color={getConnectionStatusColor()}
          />
          <Text style={styles.sectionTitle}>Bağlantı Durumu</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Durum:</Text>
          <Text style={[styles.statusValue, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon
            name="sync"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.sectionTitle}>Senkronizasyon</Text>
          
          {!isOffline && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleSync}
              disabled={isSyncing}
              activeOpacity={0.7}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Icon name="refresh" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Son senkronizasyon:</Text>
          <Text style={styles.statusValue}>{getLastSyncText()}</Text>
        </View>

        {syncStatus.pendingActions > 0 && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Bekleyen işlemler:</Text>
            <Text style={[styles.statusValue, { color: theme.colors.warning }]}>
              {syncStatus.pendingActions}
            </Text>
          </View>
        )}

        {syncStatus.pendingDrafts > 0 && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Bekleyen taslaklar:</Text>
            <Text style={[styles.statusValue, { color: theme.colors.warning }]}>
              {syncStatus.pendingDrafts}
            </Text>
          </View>
        )}

        {syncStatus.pendingActions === 0 && syncStatus.pendingDrafts === 0 && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusValue, { color: theme.colors.success }]}>
              Tüm veriler senkronize
            </Text>
          </View>
        )}
      </View>

      {/* Drafts */}
      {showDetails && drafts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="drafts"
              size={24}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>Taslaklar ({drafts.length})</Text>
          </View>

          {drafts.slice(0, 5).map((draft) => (
            <View key={draft.id} style={styles.draftItem}>
              <View style={styles.draftInfo}>
                <Text style={styles.draftTitle} numberOfLines={1}>
                  {draft.title || 'Başlıksız taslak'}
                </Text>
                <Text style={styles.draftMeta}>
                  {formatDistanceToNow(new Date(draft.lastModified), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </Text>
              </View>
              
              <View style={styles.draftStatus}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        draft.syncStatus === 'synced'
                          ? theme.colors.success
                          : draft.syncStatus === 'failed'
                          ? theme.colors.error
                          : draft.syncStatus === 'syncing'
                          ? theme.colors.primary
                          : theme.colors.warning,
                    },
                  ]}
                />
                <Text style={styles.draftStatusText}>
                  {draft.syncStatus === 'synced'
                    ? 'Senkronize'
                    : draft.syncStatus === 'failed'
                    ? 'Hata'
                    : draft.syncStatus === 'syncing'
                    ? 'Senkronize ediliyor'
                    : 'Bekliyor'}
                </Text>
              </View>
            </View>
          ))}

          {drafts.length > 5 && (
            <Text style={styles.moreText}>
              ve {drafts.length - 5} taslak daha...
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      {showDetails && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearOfflineData}
            activeOpacity={0.7}
          >
            <Icon name="clear-all" size={20} color={theme.colors.error} />
            <Text style={styles.clearButtonText}>Çevrimdışı Verileri Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 8,
      flex: 1,
    },
    syncButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    draftItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    draftInfo: {
      flex: 1,
    },
    draftTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    draftMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    draftStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    draftStatusText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    moreText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.errorLight,
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.error,
      marginLeft: 8,
    },
  });