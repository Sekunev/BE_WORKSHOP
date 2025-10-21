import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { AccessibleButton } from '../../components/ui/AccessibleButton';
import { buildAccessibilityProps } from '../../utils/accessibility';

export const AccessibilitySettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { settings, updateSetting, announceForAccessibility } = useAccessibility();

  const handleFontScaleChange = (scale: number) => {
    updateSetting('preferredFontScale', scale);
    announceForAccessibility(`Font boyutu ${scale === 1 ? 'normal' : scale === 1.2 ? 'büyük' : 'çok büyük'} olarak ayarlandı`);
  };

  const handleAnnouncementToggle = (enabled: boolean) => {
    updateSetting('announceForAccessibility', enabled);
    announceForAccessibility(enabled ? 'Sesli duyurular açıldı' : 'Sesli duyurular kapatıldı');
  };

  const showAccessibilityInfo = () => {
    Alert.alert(
      'Erişilebilirlik Hakkında',
      'Bu ayarlar uygulamanın erişilebilirlik özelliklerini kontrol eder. Sistem ayarlarınızdan da erişilebilirlik özelliklerini yönetebilirsiniz.',
      [{ text: 'Tamam' }]
    );
  };

  const testScreenReader = () => {
    announceForAccessibility('Ekran okuyucu testi başarılı. Bu mesajı duyabiliyorsanız, ekran okuyucu düzgün çalışıyor.');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18 * settings.preferredFontScale,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderRadius: 8,
      marginBottom: 8,
      minHeight: 56, // Minimum touch target
    },
    settingLabel: {
      fontSize: 16 * settings.preferredFontScale,
      color: theme.colors.text,
      flex: 1,
      marginRight: 12,
    },
    settingDescription: {
      fontSize: 14 * settings.preferredFontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      marginTop: 4,
    },
    fontScaleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    fontScaleButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      minWidth: 80,
      alignItems: 'center',
    },
    fontScaleButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    fontScaleButtonText: {
      fontSize: 14 * settings.preferredFontScale,
      color: theme.colors.primary,
    },
    fontScaleButtonTextActive: {
      color: theme.colors.background,
    },
    systemSettingsContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderRadius: 8,
      marginBottom: 16,
    },
    systemSettingsTitle: {
      fontSize: 16 * settings.preferredFontScale,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    systemSettingsText: {
      fontSize: 14 * settings.preferredFontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      lineHeight: 20 * settings.preferredFontScale,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginLeft: 8,
    },
    statusActive: {
      backgroundColor: '#4CAF50',
    },
    statusInactive: {
      backgroundColor: '#F44336',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        {...buildAccessibilityProps({
          role: 'LIST',
          label: 'Erişilebilirlik ayarları listesi',
        })}
      >
        {/* System Settings Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistem Durumu</Text>
          
          <View style={styles.systemSettingsContainer}>
            <Text style={styles.systemSettingsTitle}>Mevcut Sistem Ayarları</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ekran Okuyucu</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingDescription}>
                  {settings.isScreenReaderEnabled ? 'Aktif' : 'Pasif'}
                </Text>
                <View 
                  style={[
                    styles.statusIndicator,
                    settings.isScreenReaderEnabled ? styles.statusActive : styles.statusInactive
                  ]} 
                />
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Hareket Azaltma</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingDescription}>
                  {settings.isReduceMotionEnabled ? 'Aktif' : 'Pasif'}
                </Text>
                <View 
                  style={[
                    styles.statusIndicator,
                    settings.isReduceMotionEnabled ? styles.statusActive : styles.statusInactive
                  ]} 
                />
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Yüksek Kontrast</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingDescription}>
                  {settings.isHighContrastEnabled ? 'Aktif' : 'Pasif'}
                </Text>
                <View 
                  style={[
                    styles.statusIndicator,
                    settings.isHighContrastEnabled ? styles.statusActive : styles.statusInactive
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Font Scale Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metin Boyutu</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Font Boyutu Tercihi</Text>
              <Text style={styles.settingDescription}>
                Uygulamadaki metin boyutunu ayarlayın
              </Text>
              
              <View style={styles.fontScaleContainer}>
                {[
                  { scale: 1, label: 'Normal' },
                  { scale: 1.2, label: 'Büyük' },
                  { scale: 1.5, label: 'Çok Büyük' },
                ].map(({ scale, label }) => (
                  <TouchableOpacity
                    key={scale}
                    style={[
                      styles.fontScaleButton,
                      settings.preferredFontScale === scale && styles.fontScaleButtonActive,
                    ]}
                    onPress={() => handleFontScaleChange(scale)}
                    {...buildAccessibilityProps({
                      role: 'BUTTON',
                      label: `Font boyutu ${label}`,
                      hint: `Font boyutunu ${label} yapmak için dokunun`,
                      state: { selected: settings.preferredFontScale === scale },
                    })}
                  >
                    <Text
                      style={[
                        styles.fontScaleButtonText,
                        settings.preferredFontScale === scale && styles.fontScaleButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Announcement Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesli Duyurular</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Otomatik Duyurular</Text>
              <Text style={styles.settingDescription}>
                Önemli değişiklikler için sesli duyuru yapılsın
              </Text>
            </View>
            <Switch
              value={settings.announceForAccessibility}
              onValueChange={handleAnnouncementToggle}
              {...buildAccessibilityProps({
                role: 'SWITCH',
                label: 'Otomatik duyurular',
                hint: 'Sesli duyuruları açmak veya kapatmak için değiştirin',
                state: { checked: settings.announceForAccessibility },
              })}
            />
          </View>
        </View>

        {/* Test Functions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Fonksiyonları</Text>
          
          <AccessibleButton
            title="Ekran Okuyucu Testi"
            onPress={testScreenReader}
            variant="outline"
            accessibilityHint="Ekran okuyucunun çalışıp çalışmadığını test eder"
            style={{ marginBottom: 12 }}
          />
          
          <AccessibleButton
            title="Erişilebilirlik Hakkında"
            onPress={showAccessibilityInfo}
            variant="ghost"
            accessibilityHint="Erişilebilirlik özellikleri hakkında bilgi alın"
          />
        </View>

        {/* Help Text */}
        <View style={styles.systemSettingsContainer}>
          <Text style={styles.systemSettingsTitle}>Yardım</Text>
          <Text style={styles.systemSettingsText}>
            Sistem erişilebilirlik ayarlarını değiştirmek için cihazınızın Ayarlar {'>'} Erişilebilirlik bölümüne gidin. 
            Bu ayarlar tüm uygulamaları etkiler ve daha kapsamlı erişilebilirlik özellikleri sunar.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};