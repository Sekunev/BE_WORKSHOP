import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, TYPOGRAPHY, SPACING} from '@/constants/theme';
import {BlogCard, EmptyState, ErrorState} from '@/components/blog';
import {Loading} from '@/components/ui';
import {useGetUserBlogsQuery} from '@/store/api/userApi';
import {Blog} from '@/types/blog';

const MyBlogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  
  const {
    data: blogsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUserBlogsQuery({page, limit: 10});

  const blogs = blogsData?.blogs || [];
  const pagination = blogsData?.pagination;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [pagination, page, isFetching]);

  const handleBlogPress = (blog: Blog) => {
    navigation.getParent()?.navigate('BlogList', {
      screen: 'BlogDetail',
      params: {slug: blog.slug},
    });
  };

  const handleEditBlog = (blog: Blog) => {
    navigation.getParent()?.navigate('BlogList', {
      screen: 'EditBlog',
      params: {blogId: blog.id},
    });
  };

  const handleDeleteBlog = (blog: Blog) => {
    Alert.alert(
      'Delete Blog',
      `Are you sure you want to delete "${blog.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete functionality will be implemented with blog API
            Alert.alert('Coming Soon', 'Delete functionality will be implemented soon');
          },
        },
      ]
    );
  };

  const handleCreateBlog = () => {
    navigation.getParent()?.navigate('BlogList', {
      screen: 'CreateBlog',
    });
  };

  const renderBlogItem = ({item}: {item: Blog}) => (
    <View style={styles.blogItemContainer}>
      <BlogCard
        blog={item}
        onPress={() => handleBlogPress(item)}
      />
      <View style={styles.blogActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditBlog(item)}>
          <Icon name="edit" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBlog(item)}>
          <Icon name="delete" size={20} color={COLORS.error} />
          <Text style={[styles.actionText, {color: COLORS.error}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading size="small" />
      </View>
    );
  };

  if (isLoading && blogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" text="Loading your blogs..." />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load your blogs"
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Blogs</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateBlog}>
          <Icon name="add" size={24} color={COLORS.background.primary} />
        </TouchableOpacity>
      </View>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <EmptyState
          iconName="document-text-outline"
          title="No blogs yet"
          message="Start writing your first blog post!"
          actionText="Create Blog"
          onAction={handleCreateBlog}
        />
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: SPACING.lg,
  },
  blogItemContainer: {
    marginBottom: SPACING.lg,
  },
  blogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  footerLoader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
});

export default MyBlogsScreen;