import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/services/blogService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

interface DashboardStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  publishedBlogs: number;
  draftBlogs: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Kullanıcının bloglarını getir
      const response = await blogService.getBlogs(1, 100); // Tüm blogları getir
      console.log('Current user:', user);
      console.log('Current user ID:', user?._id);
      console.log('Available blogs:', response.data.blogs.map(b => ({
        id: b._id,
        authorId: b.author._id,
        authorName: b.author.name,
        title: b.title
      })));

      // Backend'den gelen user ID formatını kontrol et
      const userId = user?._id || user?.id;
      const userBlogs = response.data.blogs.filter(blog =>
        blog.author._id === userId || blog.author.id === userId
      );

      console.log('Filtered user blogs:', userBlogs.length);

      const totalViews = userBlogs.reduce((sum, blog) => sum + blog.viewCount, 0);
      const totalLikes = userBlogs.reduce((sum, blog) => sum + blog.likeCount, 0);
      const publishedBlogs = userBlogs.filter(blog => blog.isPublished).length;
      const draftBlogs = userBlogs.filter(blog => !blog.isPublished).length;

      setStats({
        totalBlogs: userBlogs.length,
        totalViews,
        totalLikes,
        publishedBlogs,
        draftBlogs,
      });
    } catch (error) {
      console.error('Dashboard verisi yüklenemedi:', error);
      Alert.alert('Hata', 'Dashboard verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hoş geldiniz,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statNumber}>{stats.totalBlogs}</Text>
            <Text style={styles.statLabel}>Toplam Blog</Text>
          </View>
          <View style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statNumber}>{stats.publishedBlogs}</Text>
            <Text style={styles.statLabel}>Yayınlanan</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{stats.draftBlogs}</Text>
            <Text style={styles.statLabel}>Taslak</Text>
          </View>
          <View style={[styles.statCard, styles.infoCard]}>
            <Text style={styles.statNumber}>{stats.totalViews}</Text>
            <Text style={styles.statLabel}>Toplam Görüntüleme</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.errorCard]}>
            <Text style={styles.statNumber}>{stats.totalLikes}</Text>
            <Text style={styles.statLabel}>Toplam Beğeni</Text>
          </View>
          <View style={[styles.statCard, styles.secondaryCard]}>
            <Text style={styles.statNumber}>
              {stats.totalBlogs > 0 ? Math.round(stats.totalViews / stats.totalBlogs) : 0}
            </Text>
            <Text style={styles.statLabel}>Ortalama Görüntüleme</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateBlog' as never)}
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Yeni Blog Yaz</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyBlogs' as never)}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Bloglarım</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('BlogList' as never)}
        >
          <Text style={styles.actionIcon}>📚</Text>
          <Text style={styles.actionText}>Tüm Blogları Görüntüle</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProfileSettings' as never)}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionText}>Profil Ayarları</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
    marginTop: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: COLORS.accent.blue,
  },
  successCard: {
    backgroundColor: COLORS.accent.green,
  },
  warningCard: {
    backgroundColor: COLORS.accent.orange,
  },
  infoCard: {
    backgroundColor: COLORS.accent.teal,
  },
  errorCard: {
    backgroundColor: COLORS.accent.pink,
  },
  secondaryCard: {
    backgroundColor: COLORS.accent.purple,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.lg,
    width: 32,
    textAlign: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  actionArrow: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
});

export default DashboardScreen;