import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { NotificationPreferences } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { CustomButton } from '@/components/ui/CustomButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface NotificationPreferencesScreenProps {
  navigation: any;
}

export const NotificationPreferencesScreen: React.FC<NotificationPreferencesScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'not-determined'>('not-determined');

  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      showToast('Ayarlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);

      // If enabling push notifications but permission is denied, request permission
      if (key === 'pushEnabled' && value && permissionStatus === 'denied') {
        await requestPermission();
        return;
      }

      await notificationService.updateNotificationPreferences({ [key]: value });
      showToast('Ayar güncellendi', 'success');
    } catch (error) {
      console.error('Error updating preference:', error);
      showToast('Ayar güncellenirken hata oluştu', 'error');
      
      // Revert the change
      setPreferences(prev => prev ? { ...prev, [key]: !value } : null);
    }
  };

  const requestPermission = async () => {
    try {
      const status = await notificationService.requestPermissions();
      setPermissionStatus(status);

      if (status === 'granted') {
        showToast('Bildirim izni verildi', 'success');
        if (preferences) {
          await notificationService.updateNotificationPreferences({ pushEnabled: true });
        }
      } else {
        showToast('Bildirim izni reddedildi', 'error');
        if (preferences) {
          setPreferences({ ...preferences, pushEnabled: false });
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      showToast('İzin istenirken hata oluştu', 'error');
    }
  };

  const saveAllPreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationService.updateNotificationPreferences(preferences);
      showToast('Tüm ayarlar kaydedildi', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Ayarlar kaydedilirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Bildirimleri Temizle',
      'Tüm bildirimleri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAllNotifications();
              showToast('Tüm bildirimler silindi', 'success');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              showToast('Bildirimler silinirken hata oluştu', 'error');
            }
          },
        },
      ]
    );
  };

  const renderPreferenceItem = (
    key: keyof NotificationPreferences,
    title: string,
    description: string,
    icon: string,
    disabled = false
  ) => {
    if (!preferences) return null;

    return (
      <View style={[styles.preferenceItem, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.preferenceContent}>
          <View style={styles.preferenceHeader}>
            <Icon name={icon} size={24} color={theme.colors.primary} />
            <View style={styles.preferenceText}>
              <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
                {description}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences[key] as boolean}
            onValueChange={(value) => updatePreference(key, value)}
            disabled={disabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Ayarlar yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Bildirim İzni
          </Text>
          <View style={styles.permissionStatus}>
            <Icon
              name={permissionStatus === 'granted' ? 'check-circle' : 'error'}
              size={24}
              color={permissionStatus === 'granted' ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.permissionText, { color: theme.colors.text }]}>
              {permissionStatus === 'granted'
                ? 'Bildirim izni verildi'
                : permissionStatus === 'denied'
                ? 'Bildirim izni reddedildi'
                : 'Bildirim izni belirlenmedi'}
            </Text>
          </View>
          {permissionStatus !== 'granted' && (
            <CustomButton
              title="İzin İste"
              onPress={requestPermission}
              variant="outline"
              size="small"
            />
          )}
        </View>

        {/* Push Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Push Bildirimleri
          </Text>
          {renderPreferenceItem(
            'pushEnabled',
            'Push Bildirimleri',
            'Mobil cihazınıza bildirim gönderilsin',
            'notifications',
            permissionStatus !== 'granted'
          )}
        </View>

        {/* Blog Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Blog Bildirimleri
          </Text>
          {renderPreferenceItem(
            'newBlogs',
            'Yeni Blog Yazıları',
            'Yeni blog yazıları yayınlandığında bildirim al',
            'article'
          )}
          {renderPreferenceItem(
            'blogLikes',
            'Blog Beğenileri',
            'Bloglarınız beğenildiğinde bildirim al',
            'favorite'
          )}
          {renderPreferenceItem(
            'blogComments',
            'Blog Yorumları',
            'Bloglarınıza yorum yapıldığında bildirim al',
            'comment'
          )}
        </View>

        {/* Social Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sosyal Bildirimler
          </Text>
          {renderPreferenceItem(
            'authorFollows',
            'Yazar Takipleri',
            'Sizi takip etmeye başladığında bildirim al',
            'person-add'
          )}
        </View>

        {/* System Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sistem Bildirimleri
          </Text>
          {renderPreferenceItem(
            'systemNotifications',
            'Sistem Bildirimleri',
            'Uygulama güncellemeleri ve sistem mesajları',
            'settings'
          )}
          {renderPreferenceItem(
            'generalNotifications',
            'Genel Bildirimler',
            'Genel duyurular ve önemli bilgiler',
            'info'
          )}
        </View>

        {/* Email Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            E-posta Bildirimleri
          </Text>
          {renderPreferenceItem(
            'emailEnabled',
            'E-posta Bildirimleri',
            'E-posta ile bildirim almak istiyorum',
            'email'
          )}
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            İşlemler
          </Text>
          
          <TouchableOpacity
            style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
            onPress={clearAllNotifications}
          >
            <Icon name="clear-all" size={24} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>
              Tüm Bildirimleri Temizle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <CustomButton
            title="Ayarları Kaydet"
            onPress={saveAllPreferences}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceItem: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  preferenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonContainer: {
    margin: 16,
    marginTop: 32,
  },
});

export default NotificationPreferencesScreen;