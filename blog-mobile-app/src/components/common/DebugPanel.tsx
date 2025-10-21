import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { lightTheme } from '../../constants/themes';
import { monitoringService } from '../../services/monitoringService';
import { debugLoggingService } from '../../services/debugLoggingService';
import { performanceMonitoringService } from '../../services/performanceMonitoringService';
import { errorHandlingService } from '../../services/errorHandlingService';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'errors' | 'performance' | 'logs' | 'analytics'>('errors');
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMonitoringData();
    }
  }, [visible, activeTab]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      const data = await monitoringService.getMonitoringReport();
      setMonitoringData(data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Tüm Verileri Temizle',
      'Tüm monitoring verilerini temizlemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await monitoringService.clearAllData();
              await loadMonitoringData();
              Alert.alert('Başarılı', 'Tüm monitoring verileri temizlendi.');
            } catch (error) {
              Alert.alert('Hata', 'Veriler temizlenirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        monitoringReport: monitoringData,
        debugLogs: await debugLoggingService.exportLogs(),
        performanceMetrics: await performanceMonitoringService.exportMetrics(),
      };

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: dataString,
        title: 'Debug Data Export',
      });
    } catch (error) {
      Alert.alert('Hata', 'Veriler export edilirken bir hata oluştu.');
    }
  };

  const testErrorReporting = async () => {
    try {
      await monitoringService.testErrorReporting();
      Alert.alert('Test Tamamlandı', 'Error reporting test başarıyla tamamlandı.');
      await loadMonitoringData();
    } catch (error) {
      Alert.alert('Test Hatası', 'Error reporting test sırasında bir hata oluştu.');
    }
  };

  const renderErrorsTab = () => {
    const errorStats = monitoringData?.errorStatistics;
    if (!errorStats) return <Text style={styles.noData}>Veri yükleniyor...</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Hata İstatistikleri</Text>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Hata:</Text>
          <Text style={styles.statValue}>{errorStats.totalErrors}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Önem Derecesine Göre</Text>
        {Object.entries(errorStats.errorsBySeverity || {}).map(([severity, count]) => (
          <View key={severity} style={styles.statRow}>
            <Text style={styles.statLabel}>{severity}:</Text>
            <Text style={styles.statValue}>{count}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Son Hatalar</Text>
        <ScrollView style={styles.logContainer}>
          {errorStats.recentErrors?.map((error: any, index: number) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logTimestamp}>{new Date(error.timestamp).toLocaleString()}</Text>
              <Text style={styles.logMessage}>{error.error.name}: {error.error.message}</Text>
              <Text style={styles.logSeverity}>Önem: {error.severity}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPerformanceTab = () => {
    const perfStats = monitoringData?.performanceStatistics;
    if (!perfStats) return <Text style={styles.noData}>Veri yükleniyor...</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Performans İstatistikleri</Text>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Metrik:</Text>
          <Text style={styles.statValue}>{perfStats.totalMetrics}</Text>
        </View>

        <Text style={styles.sectionTitle}>Ortalama Süreler</Text>
        {Object.entries(perfStats.averageDurations || {}).map(([name, duration]) => (
          <View key={name} style={styles.statRow}>
            <Text style={styles.statLabel}>{name}:</Text>
            <Text style={styles.statValue}>{Math.round(duration as number)}ms</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>En Yavaş İşlemler</Text>
        <ScrollView style={styles.logContainer}>
          {perfStats.slowestOperations?.map((metric: any, index: number) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logTimestamp}>{new Date(metric.timestamp).toLocaleString()}</Text>
              <Text style={styles.logMessage}>{metric.name}: {metric.duration}ms</Text>
              <Text style={styles.logSeverity}>Tip: {metric.type}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLogsTab = () => {
    const logStats = monitoringData?.logStatistics;
    if (!logStats) return <Text style={styles.noData}>Veri yükleniyor...</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Log İstatistikleri</Text>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Log:</Text>
          <Text style={styles.statValue}>{logStats.totalLogs}</Text>
        </View>

        <Text style={styles.sectionTitle}>Seviyeye Göre</Text>
        {Object.entries(logStats.logsByLevel || {}).map(([level, count]) => (
          <View key={level} style={styles.statRow}>
            <Text style={styles.statLabel}>{level}:</Text>
            <Text style={styles.statValue}>{count}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Son Aktivite</Text>
        <ScrollView style={styles.logContainer}>
          {logStats.recentActivity?.map((log: any, index: number) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logTimestamp}>{new Date(log.timestamp).toLocaleString()}</Text>
              <Text style={styles.logMessage}>[{log.level.toUpperCase()}] {log.message}</Text>
              <Text style={styles.logSeverity}>Kategori: {log.category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAnalyticsTab = () => {
    const analyticsData = monitoringData?.analyticsData;
    if (!analyticsData) return <Text style={styles.noData}>Veri yükleniyor...</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Analytics Verileri</Text>
        
        {analyticsData.userAnalytics && (
          <>
            <Text style={styles.sectionTitle}>Kullanıcı İstatistikleri</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Okunan Blog:</Text>
              <Text style={styles.statValue}>{analyticsData.userAnalytics.blogsRead}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Beğenilen Blog:</Text>
              <Text style={styles.statValue}>{analyticsData.userAnalytics.blogsLiked}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Paylaşılan Blog:</Text>
              <Text style={styles.statValue}>{analyticsData.userAnalytics.blogsShared}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Oturum Sayısı:</Text>
              <Text style={styles.statValue}>{analyticsData.userAnalytics.sessionCount}</Text>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Son Olaylar</Text>
        <ScrollView style={styles.logContainer}>
          {analyticsData.events?.slice(0, 10).map((event: any, index: number) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logTimestamp}>{new Date(event.timestamp).toLocaleString()}</Text>
              <Text style={styles.logMessage}>{event.event}</Text>
              {event.properties && (
                <Text style={styles.logSeverity}>
                  {JSON.stringify(event.properties, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'errors':
        return renderErrorsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'logs':
        return renderLogsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return null;
    }
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'errors', label: 'Hatalar' },
            { key: 'performance', label: 'Performans' },
            { key: 'logs', label: 'Loglar' },
            { key: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loading}>Yükleniyor...</Text>
          ) : (
            renderTabContent()
          )}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={loadMonitoringData}>
            <Text style={styles.actionButtonText}>Yenile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={testErrorReporting}>
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllData}>
            <Text style={styles.actionButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: lightTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
  },
  closeButton: {
    padding: lightTheme.spacing.sm,
  },
  closeButtonText: {
    fontSize: lightTheme.typography.fontSize.lg,
    color: lightTheme.colors.text.secondary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: lightTheme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: lightTheme.colors.primary,
  },
  tabText: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.text.secondary,
  },
  activeTabText: {
    color: lightTheme.colors.primary,
    fontWeight: lightTheme.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: lightTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.semibold,
    color: lightTheme.colors.text.primary,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
  },
  statCard: {
    backgroundColor: lightTheme.colors.background.secondary,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    marginBottom: lightTheme.spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: lightTheme.spacing.xs,
  },
  statLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.text.secondary,
  },
  statValue: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.semibold,
    color: lightTheme.colors.text.primary,
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: lightTheme.colors.background.secondary,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.sm,
  },
  logItem: {
    marginBottom: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  logTimestamp: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.text.secondary,
  },
  logMessage: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.text.primary,
    marginTop: lightTheme.spacing.xs,
  },
  logSeverity: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.text.secondary,
    marginTop: lightTheme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: lightTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  actionButton: {
    flex: 1,
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: lightTheme.spacing.sm,
    marginHorizontal: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: lightTheme.colors.error,
  },
  actionButtonText: {
    color: lightTheme.colors.text.inverse,
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.semibold,
  },
  loading: {
    textAlign: 'center',
    padding: lightTheme.spacing.lg,
    color: lightTheme.colors.text.secondary,
  },
  noData: {
    textAlign: 'center',
    padding: lightTheme.spacing.lg,
    color: lightTheme.colors.text.secondary,
  },
});

export default DebugPanel;