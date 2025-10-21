import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/common';
import { Blog, BlogQueryParams } from '@/types/blog';
import BlogService from '@/services/blogService';

interface BlogListWithOfflineProps {
  onBlogPress: (blog: Blog) => void;
  searchParams?: BlogQueryParams;
}

export const BlogListWithOffline: React.FC<BlogListWithOfflineProps> = ({
  onBlogPress,
  searchParams = {},
}) => {
  const { theme } = useTheme();
  const { isOffline, isBlogAvailableOffline } = useOffline();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlogs = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await BlogService.getBlogs(searchParams);
      setBlogs(result.blogs);
    } catch (err) {
      console.error('Failed to load blogs:', err);
      setError(isOffline ? 'Çevrimdışı - Önbellekteki veriler gösteriliyor' : 'Bloglar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [searchParams]);

  const handleRefresh = () => {
    if (!isOffline) {
      loadBlogs(true);
    }
  };

  const renderBlogItem = ({ item }: { item: Blog }) => {
    const isAvailableOffline = isBlogAvailableOffline(item.id);
    
    return (
      <TouchableOpacity
        style={styles.blogItem}
        onPress={() => onBlogPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.blogContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          {item.excerpt && (
            <Text style={styles.blogExcerpt} numberOfLines={3}>
              {item.excerpt}
            </Text>
          )}
          
          <View style={styles.blogMeta}>
            <Text style={styles.blogAuthor}>{item.author.name}</Text>
            <Text style={styles.blogDate}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </Text>
            
            {isAvailableOffline && (
              <View style={styles.offlineIndicator}>
                <Icon name="cloud-done" size={16} color={theme.colors.success} />
                <Text style={styles.offlineText}>Çevrimdışı</Text>
              </View>
            )}
          </View>
        </View>
        
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name={isOffline ? "cloud-off" : "article"}
        size={64}
        color={theme.colors.textSecondary }
      />
      <Text style={styles.emptyTitle}>
        {isOffline ? 'Çevrimdışısınız' : 'Blog bulunamadı'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isOffline
          ? 'İnternet bağlantınızı kontrol edin veya önbellekteki blogları görüntüleyin'
          : 'Henüz hiç blog yayınlanmamış'}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={64} color={theme.colors.error} />
      <Text style={styles.errorTitle}>Hata Oluştu</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      
      {!isOffline && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadBlogs()}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      
      {error && !loading ? (
        renderError()
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              enabled={!isOffline}
            />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
          contentContainerStyle={blogs.length === 0 ? styles.emptyContainer : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    blogItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    blogContent: {
      flex: 1,
    },
    blogTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    blogExcerpt: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    blogMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    blogAuthor: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
      marginRight: 12,
    },
    blogDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: 12,
    },
    offlineIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    offlineText: {
      fontSize: 10,
      color: theme.colors.success,
      fontWeight: '600',
      marginLeft: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    errorState: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 64,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.error,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    errorSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.surface,
    },
  });

export default BlogListWithOffline;