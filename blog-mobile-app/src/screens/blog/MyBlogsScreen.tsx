import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { blogService, Blog } from '@/services/blogService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const MyBlogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyBlogs();
  }, []);

  const loadMyBlogs = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await blogService.getMyBlogs(1, 50);
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Bloglarım yüklenemedi:', error);
      Alert.alert('Hata', 'Bloglarınız yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadMyBlogs(true);
  };

  const handleBlogPress = (blog: Blog) => {
    navigation.navigate('BlogDetail' as never, { blogId: blog._id } as never);
  };

  const handleEditBlog = (blog: Blog) => {
    navigation.navigate('EditBlog' as never, { blogId: blog._id } as never);
  };

  const handleDeleteBlog = (blog: Blog) => {
    Alert.alert(
      'Blog Sil',
      `"${blog.title}" adlı blog yazısını silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await blogService.deleteBlog(blog._id);
              Alert.alert('Başarılı', 'Blog yazısı silindi');
              loadMyBlogs(); // Listeyi yenile
            } catch (error: any) {
              console.error('Blog silme hatası:', error);
              Alert.alert(
                'Hata',
                error.response?.data?.message || 'Blog silinemedi'
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderBlogItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => handleBlogPress(item)}
    >
      <View style={styles.blogHeader}>
        <View style={styles.blogInfo}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.blogExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            item.isPublished ? styles.publishedBadge : styles.draftBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.isPublished ? styles.publishedText : styles.draftText
            ]}>
              {item.isPublished ? 'Yayında' : 'Taslak'}
            </Text>
          </View>
          
          {item.aiGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiText}>AI</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.blogMeta}>
        <Text style={styles.metaText}>
          {formatDate(item.publishedAt || item.createdAt)}
        </Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{item.category}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{item.readingTime} dk</Text>
      </View>

      <View style={styles.blogStats}>
        <Text style={styles.statText}>👁 {item.viewCount}</Text>
        <Text style={styles.statText}>❤️ {item.likeCount}</Text>
        <Text style={styles.statText}>💬 {item.commentCount}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditBlog(item)}
        >
          <Text style={styles.actionButtonText}>✏️ Düzenle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBlog(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Sil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Bloglarınız yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bloglarım</Text>
        <Text style={styles.headerSubtitle}>
          {blogs.length} blog yazınız var
        </Text>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateBlog' as never)}
        >
          <Text style={styles.createButtonText}>+ Yeni Blog Yaz</Text>
        </TouchableOpacity>
      </View>

      {blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Henüz blog yazınız yok</Text>
          <Text style={styles.emptyText}>
            İlk blog yazınızı oluşturmak için yukarıdaki butona tıklayın
          </Text>
        </View>
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  listContainer: {
    padding: SPACING.md,
  },
  blogCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  blogInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  blogTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  blogExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  publishedBadge: {
    backgroundColor: COLORS.success,
  },
  draftBadge: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  publishedText: {
    color: COLORS.text.inverse,
  },
  draftText: {
    color: COLORS.text.inverse,
  },
  aiBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  aiText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  blogStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border.primary,
    marginBottom: SPACING.sm,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  deleteButtonText: {
    color: COLORS.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MyBlogsScreen;