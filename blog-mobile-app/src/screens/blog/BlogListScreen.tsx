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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { blogService, Blog } from '@/services/blogService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const BlogListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await blogService.getBlogs(pageNum, 10);
      
      if (refresh || pageNum === 1) {
        setBlogs(response.data.blogs);
      } else {
        setBlogs(prev => [...prev, ...response.data.blogs]);
      }
      
      setHasMore(pageNum < response.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
      Alert.alert('Hata', 'Blog yazıları yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadBlogs(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadBlogs(page + 1);
    }
  };

  const handleBlogPress = (blog: Blog) => {
    navigation.navigate('BlogDetail' as never, { blogId: blog._id } as never);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderBlogItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => handleBlogPress(item)}
    >
      {item.featuredImage && (
        <Image 
          source={{ uri: item.featuredImage }} 
          style={styles.blogImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.blogContent}>
        <View style={styles.blogHeader}>
          <Text style={styles.category}>{item.category}</Text>
          {item.aiGenerated && (
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>AI</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.blogExcerpt} numberOfLines={3}>
          {item.excerpt}
        </Text>
        
        <View style={styles.blogFooter}>
          <View style={styles.authorInfo}>
            {item.author.avatar && (
              <Image 
                source={{ uri: item.author.avatar }} 
                style={styles.authorAvatar}
              />
            )}
            <Text style={styles.authorName}>{item.author.name}</Text>
          </View>
          
          <View style={styles.blogMeta}>
            <Text style={styles.metaText}>
              {formatDate(item.publishedAt || item.createdAt)}
            </Text>
            <Text style={styles.metaText}>
              {item.readingTime} dk okuma
            </Text>
          </View>
        </View>
        
        <View style={styles.blogStats}>
          <Text style={styles.statText}>👁 {item.viewCount}</Text>
          <Text style={styles.statText}>❤️ {item.likeCount}</Text>
          <Text style={styles.statText}>💬 {item.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Daha fazla yükleniyor...</Text>
      </View>
    );
  };

  if (loading && blogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Blog yazıları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blog Yazıları</Text>
        <Text style={styles.headerSubtitle}>
          {blogs.length} yazı bulundu
        </Text>
      </View>
      
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
  },
  listContainer: {
    padding: SPACING.md,
  },
  blogCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  blogImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  blogContent: {
    padding: SPACING.md,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  aiTag: {
    backgroundColor: COLORS.accent.purple,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  aiTagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  blogTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  blogExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  blogMeta: {
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  blogStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
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
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
});

export default BlogListScreen;