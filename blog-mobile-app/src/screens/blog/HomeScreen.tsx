import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Dashboard',
      subtitle: 'İstatistiklerinizi görüntüleyin',
      icon: '📈',
      gradient: ['#E0F2FE', '#BAE6FD'], // Açık mavi tonları
      onPress: () => navigation.navigate('Dashboard' as never),
    },
    {
      title: 'Blog Yazıları',
      subtitle: 'Tüm blog yazılarını keşfedin',
      icon: '📄',
      gradient: ['#DCFCE7', '#BBF7D0'], // Açık yeşil tonları
      onPress: () => navigation.navigate('BlogList' as never),
    },
    {
      title: 'Yeni Yazı Ekle',
      subtitle: 'Yeni bir blog yazısı oluşturun',
      icon: '➕',
      gradient: ['#EDE9FE', '#DDD6FE'], // Açık mor tonları
      onPress: () => navigation.navigate('CreateBlog' as never),
    },
  ];

  const quickActions = [
    { title: 'Son Yazılar', icon: '📝', count: '12' },
    { title: 'Toplam Görüntülenme', icon: '👀', count: '1.2K' },
    { title: 'Beğeniler', icon: '💙', count: '89' },
    { title: 'Yorumlar', icon: '💭', count: '45' },
  ];

  // Avatar URL'ini al
  const getAvatarUrl = () => {
    // Gerçek kullanıcı avatarı
    console.log(user?.avatar);
    if (user?.avatar) return user.avatar;

    // LinkedIn profil fotoğrafı (örnek)
    return 'https://media.licdn.com/dms/image/v2/D4D03AQF3dmldcGNCFg/profile-displayphoto-crop_800_800/B4DZmmWAxPJcAM-/0/1759432412813?e=1762387200&v=beta&t=_0uLJU6gqTg2138KYv2mgaWyGaa-dLia0yMpF1ChxGQ';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
              {!avatarError ? (
                <Image
                  source={{ uri: getAvatarUrl() }}
                  style={styles.avatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Merhaba! 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Modern Welcome Section */}
        <View style={styles.welcomeSection}>
          <LinearGradient
            colors={['#F8FAFC', '#E2E8F0']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeMainTitle}>Blog Uygulaması</Text>
              <Text style={styles.welcomeSubtitle}>
                Hoş geldiniz, {user?.name || 'Abdullah AHLATLI'}!
              </Text>
              <Text style={styles.welcomeDescription}>
                Buradan blog yazılarını görüntüleyebilir,{'\n'}
                yeni yazılar ekleyebilir ve profilinizi{'\n'}
                yönetebilirsiniz.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Hızlı Bakış</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            {quickActions.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={styles.statCount}>{stat.count}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Menu Cards */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Ana Menü</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={item.onPress}
              activeOpacity={0.9}
            >
              <View style={styles.menuCardContent}>
                <View style={styles.menuIconContainer}>
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.menuIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.menuIconText}>{item.icon}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuArrowContainer}>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.inverse,
    opacity: 0.9,
    marginBottom: SPACING.xs / 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeSection: {
    margin: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeGradient: {
    padding: SPACING.xl,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeMainTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  welcomeDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsScroll: {
    marginBottom: SPACING.lg,
  },
  statCard: {
    marginRight: SPACING.md,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
  },
  statIcon: {
    fontSize: 26,
    marginBottom: SPACING.xs,
    color: '#374151', // Koyu gri renk
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: SPACING.lg,
  },
  menuCard: {
    backgroundColor: COLORS.background.card,
    marginBottom: SPACING.md,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  menuIconContainer: {
    marginRight: SPACING.md,
  },
  menuIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconText: {
    fontSize: 28,
    color: '#374151', // Koyu gri renk
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  menuArrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuArrow: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default HomeScreen;