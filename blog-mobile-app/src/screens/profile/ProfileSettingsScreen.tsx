import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    avatar: user?.avatar || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: (user as any).bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'İsim alanı zorunludur');
      return;
    }

    try {
      setLoading(true);
      await userService.updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim(),
      });
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Profil güncellenemedi'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Hata', 'Tüm şifre alanları zorunludur');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      Alert.alert('Başarılı', 'Şifreniz değiştirildi');
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Şifre değiştirilemedi'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    const options = [
      'Fotoğraf Çek',
      'Galeriden Seç',
      'URL Gir',
      'İptal'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          handleAvatarOption(buttonIndex);
        }
      );
    } else {
      Alert.alert(
        'Avatar Değiştir',
        'Nasıl değiştirmek istiyorsunuz?',
        [
          { text: 'Fotoğraf Çek', onPress: () => handleAvatarOption(0) },
          { text: 'Galeriden Seç', onPress: () => handleAvatarOption(1) },
          { text: 'URL Gir', onPress: () => handleAvatarOption(2) },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    }
  };

  const handleAvatarOption = (buttonIndex: number) => {
    switch (buttonIndex) {
      case 0: // Fotoğraf Çek
        launchCamera(
          {
            mediaType: 'photo' as MediaType,
            quality: 0.8,
            maxWidth: 400,
            maxHeight: 400,
          },
          handleImageResponse
        );
        break;
      case 1: // Galeriden Seç
        launchImageLibrary(
          {
            mediaType: 'photo' as MediaType,
            quality: 0.8,
            maxWidth: 400,
            maxHeight: 400,
          },
          handleImageResponse
        );
        break;
      case 2: // URL Gir
        Alert.prompt(
          'Avatar URL',
          'Avatar için URL girin:',
          (url) => {
            if (url && url.trim()) {
              setFormData({ ...formData, avatar: url.trim() });
            }
          },
          'plain-text',
          formData.avatar
        );
        break;
    }
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        // Gerçek uygulamada burada resmi sunucuya yükleyip URL alırsınız
        // Şimdilik local URI'yi kullanıyoruz
        setFormData({ ...formData, avatar: asset.uri });
        Alert.alert(
          'Bilgi',
          'Gerçek uygulamada resim sunucuya yüklenecek. Şimdilik local resim kullanılıyor.'
        );
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesap Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme özelliği henüz hazır değil');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profil Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
        
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {formData.avatar ? (
            <Image source={{ uri: formData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {formData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={handleChangeAvatar}
          >
            <Text style={styles.changeAvatarText}>Fotoğraf Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* İsim */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>İsim *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Adınızı ve soyadınızı girin"
          />
        </View>

        {/* E-posta (readonly) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={[styles.input, styles.readonlyInput]}
            value={formData.email}
            editable={false}
            placeholder="E-posta adresi"
          />
          <Text style={styles.helperText}>E-posta adresi değiştirilemez</Text>
        </View>

        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hakkımda</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Kendiniz hakkında kısa bilgi"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{formData.bio.length}/200</Text>
        </View>

        {/* Avatar URL */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            style={styles.input}
            value={formData.avatar}
            onChangeText={(text) => setFormData({ ...formData, avatar: text })}
            placeholder="https://example.com/avatar.jpg"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.text.inverse} />
          ) : (
            <Text style={styles.buttonText}>Profili Güncelle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Şifre Değiştirme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mevcut Şifre *</Text>
          <TextInput
            style={styles.input}
            value={passwordData.currentPassword}
            onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
            placeholder="Mevcut şifrenizi girin"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yeni Şifre *</Text>
          <TextInput
            style={styles.input}
            value={passwordData.newPassword}
            onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
            placeholder="Yeni şifrenizi girin"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yeni Şifre Tekrar *</Text>
          <TextInput
            style={styles.input}
            value={passwordData.confirmPassword}
            onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
            placeholder="Yeni şifrenizi tekrar girin"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.text.inverse} />
          ) : (
            <Text style={styles.buttonText}>Şifreyi Değiştir</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tehlikeli İşlemler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tehlikeli İşlemler</Text>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Hesabı Sil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={logout}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.sm,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarPlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  changeAvatarButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.accent.blue,
    shadowColor: COLORS.accent.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    backgroundColor: COLORS.background.card,
    color: COLORS.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  readonlyInput: {
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.secondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  button: {
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.accent.blue,
  },
  warningButton: {
    backgroundColor: COLORS.accent.orange,
  },
  dangerButton: {
    backgroundColor: COLORS.accent.pink,
  },
  secondaryButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
  },
});

export default ProfileSettingsScreen;