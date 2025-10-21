import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useOffline } from '@/hooks/useOffline';
import { SyncStatus, OfflineIndicator } from '@/components/common';
import { StackNavigationProp } from '@react-navigation/stack';

interface OfflineScreenProps {
  navigation: StackNavigationProp<any>;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    isOffline,
    networkState,
    drafts,
    syncStatus,
    syncPendingData,
    clearOfflineData,
    preloadBlogsForOffline,
  } = useOffline();

  const handleClearOfflineData = () => {
    Alert.alert(
      'Çevrimdışı Verileri Temizle',
      'Tüm çevrimdışı veriler (taslaklar, önbellek, bekleyen işlemler) silinecek. Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            clearOfflineData();
            Alert.alert('Başarılı', 'Çevrimdışı veriler temizlendi.');
          },
        },
      ]
    );
  };

  const handlePreloadBlogs = async () => {
    try {
      // Example: preload some popular blog IDs
      const popularBlogIds = ['blog1', 'blog2', 'blog3'];
      await preloadBlogsForOffline(popularBlogIds);
      Alert.alert('Başarılı', 'Bloglar çevrimdışı okuma için hazırlandı.');
    } catch (error) {
      Alert.alert('Hata', 'Bloglar hazırlanırken bir hata oluştu.');
    }
  };

  const handleSyncData = async () => {
    try {
      await syncPendingData();
      Alert.alert('Başarılı', 'Veriler senkronize edildi.');
    } catch (error) {
      Alert.alert('Hata', 'Senkronizasyon sırasında bir hata oluştu.');
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <OfflineIndicator showSyncButton={true} />
      
      <ScrollView style={styles.content}>
        {/* Network Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name={isOffline ? 'cloud-off' : 'cloud-done'}
              size={24}
              color={isOffline ? theme.colors.error : theme.colors.success}
            />
            <Text style={styles.cardTitle}>Ağ Durumu</Text>
          </View>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Bağlantı</Text>
              <Text style={[
                styles.statusValue,
                { color: networkState.isConnected ? theme.colors.success : theme.colors.error }
              ]}>
                {networkState.isConnected ? 'Bağlı' : 'Bağlı Değil'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>İnternet</Text>
              <Text style={[
                styles.statusValue,
                { color: networkState.isInternetReachable ? theme.colors.success : theme.colors.error }
              ]}>
                {networkState.isInternetReachable ? 'Erişilebilir' : 'Erişilemez'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Tür</Text>
              <Text style={styles.statusValue}>{networkState.type}</Text>
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="sync" size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Senkronizasyon Durumu</Text>
          </View>
          
          <SyncStatus showDetails={true} />
        </View>

        {/* Drafts Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="drafts" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.cardTitle}>Taslaklar</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{drafts.length}</Text>
              <Text style={styles.statLabel}>Toplam Taslak</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {drafts.filter(d => d.syncStatus === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {drafts.filter(d => d.isOfflineDraft).length}
              </Text>
              <Text style={styles.statLabel}>Çevrimdışı</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İşlemler</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryLight }]}
            onPress={handleSyncData}
            disabled={isOffline}
            activeOpacity={0.7}
          >
            <Icon name="sync" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              Verileri Senkronize Et
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.successLight }]}
            onPress={handlePreloadBlogs}
            disabled={isOffline}
            activeOpacity={0.7}
          >
            <Icon name="cloud-download" size={20} color={theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
              Popüler Blogları İndir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.errorLight }]}
            onPress={handleClearOfflineData}
            activeOpacity={0.7}
          >
            <Icon name="clear-all" size={20} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              Çevrimdışı Verileri Temizle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="lightbulb-outline" size={24} color={theme.colors.warning} />
            <Text style={styles.cardTitle}>İpuçları</Text>
          </View>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>
                Çevrimdışıyken okuduğunuz bloglar otomatik olarak kaydedilir
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>
                Taslaklar çevrimdışıyken kaydedilir ve bağlantı geldiğinde senkronize edilir
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>
                Popüler blogları önceden indirerek çevrimdışı okuma deneyiminizi iyileştirin
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 8,
    },
    statusGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statusItem: {
      flex: 1,
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 12,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    tipsList: {
      marginTop: 8,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    tipText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
      flex: 1,
      lineHeight: 20,
    },
  });

export default OfflineScreen;