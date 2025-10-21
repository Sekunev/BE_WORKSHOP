import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {BlogStackParamList} from '@/navigation/types';
import {useGetBlogsQuery} from '@/store/api/blogApi';
import {Blog} from '@/types/blog';
import {useTheme} from '@/contexts/ThemeContext';
import {useCommonStyles} from '@/constants/commonStyles';
import {formatDate, formatReadingTime} from '@/utils/formatters';
import {LoadingSpinner} from '@/components/common';

interface RelatedBlogsProps {
  currentBlogId: string;
  category: string;
  tags: string[];
}

type NavigationProp = StackNavigationProp<BlogStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

const RelatedBlogs = ({
  currentBlogId,
  category,
  tags,
}: RelatedBlogsProps) => {
  const navigation = useNavigation<NavigationProp>();
  const {theme} = useTheme();
  const commonStyles = useCommonStyles(theme);

  // Fetch related blogs based on category and tags
  const {data: blogsData, isLoading} = useGetBlogsQuery({
    category,
    tags: tags.slice(0, 2), // Limit to first 2 tags to avoid too specific queries
    limit: 6,
  });

  // Filter out current blog and limit to 5 related blogs
  const relatedBlogs = useMemo(() => {
    if (!blogsData?.blogs) return [];
    return blogsData.blogs
      .filter(blog => blog.id !== currentBlogId)
      .slice(0, 5);
  }, [blogsData?.blogs, currentBlogId]);

  const handleBlogPress = (slug: string) => {
    navigation.push('BlogDetail', {slug});
  };

  const renderRelatedBlog = ({item}: {item: Blog}) => (
    <TouchableOpacity
      style={[styles.blogCard, {backgroundColor: theme.colors.surface.primary}]}
      onPress={() => handleBlogPress(item.slug)}
      activeOpacity={0.8}
    >
      {item.featuredImage && (
        <Image
          source={{uri: item.featuredImage}}
          style={styles.blogImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.blogContent}>
        <Text
          style={[commonStyles.heading3, styles.blogTitle]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        
        {item.excerpt && (
          <Text
            style={[commonStyles.bodySmall, styles.blogExcerpt]}
            numberOfLines={3}
          >
            {item.excerpt}
          </Text>
        )}
        
        <View style={styles.blogMeta}>
          <View style={styles.authorInfo}>
            <Text style={[commonStyles.caption, styles.authorName]}>
              {item.author.name}
            </Text>
            <Text style={[commonStyles.caption, styles.metaDivider]}>•</Text>
            <Text style={[commonStyles.caption, styles.metaText]}>
              {formatDate(item.publishedAt || item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.statsInfo}>
            <Icon name="schedule" size={12} color={theme.colors.text.tertiary} />
            <Text style={[commonStyles.caption, styles.readingTime]}>
              {formatReadingTime(item.readingTime)}
            </Text>
          </View>
        </View>
        
        {/* Category tag */}
        <View style={[styles.categoryTag, {backgroundColor: theme.colors.primary + '20'}]}>
          <Text style={[styles.categoryText, {color: theme.colors.primary}]}>
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="small" />
      </View>
    );
  }

  if (relatedBlogs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[commonStyles.heading2, styles.sectionTitle]}>
          İlgili Yazılar
        </Text>
        <Icon name="article" size={24} color={theme.colors.primary} />
      </View>
      
      <FlatList
        data={relatedBlogs}
        renderItem={renderRelatedBlog}
        keyExtractor={(item: Blog) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  separator: {
    width: 16,
  },
  blogCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  blogImage: {
    width: '100%',
    height: 140,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  blogExcerpt: {
    marginBottom: 12,
    lineHeight: 18,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
  },
  metaDivider: {
    marginHorizontal: 6,
  },
  metaText: {
    flex: 1,
  },
  statsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTime: {
    marginLeft: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default RelatedBlogs;