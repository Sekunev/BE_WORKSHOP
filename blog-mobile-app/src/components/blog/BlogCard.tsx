import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Blog} from '@/types/blog';
import {useTheme} from '@/contexts/ThemeContext';
import {formatDate, formatReadingTime} from '@/utils/formatters';

interface BlogCardProps {
  blog: Blog;
  onPress: (blog: Blog) => void;
  style?: ViewStyle;
}

const BlogCard: React.FC<BlogCardProps> = ({blog, onPress, style}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const handlePress = () => {
    onPress(blog);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}>
      {/* Featured Image */}
      {blog.featuredImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{uri: blog.featuredImage}}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Category */}
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{blog.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {blog.title}
        </Text>

        {/* Excerpt */}
        {blog.excerpt && (
          <Text style={styles.excerpt} numberOfLines={3}>
            {blog.excerpt}
          </Text>
        )}

        {/* Author and Meta Info */}
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            {blog.author.avatar && (
              <Image
                source={{uri: blog.author.avatar}}
                style={styles.avatar}
              />
            )}
            <View style={styles.authorText}>
              <Text style={styles.authorName}>{blog.author.name}</Text>
              <Text style={styles.publishDate}>
                {formatDate(blog.publishedAt || blog.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.readingTime}>
              {formatReadingTime(blog.readingTime)}
            </Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>{blog.viewCount} views</Text>
              <Text style={styles.statText}>•</Text>
              <Text style={styles.statText}>{blog.likeCount} likes</Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {blog.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {blog.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{blog.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    imageContainer: {
      height: 200,
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    content: {
      padding: theme.spacing.md,
    },
    categoryContainer: {
      marginBottom: theme.spacing.sm,
    },
    category: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.primary.main,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      lineHeight: theme.typography.lineHeight.tight,
      marginBottom: theme.spacing.sm,
    },
    excerpt: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: theme.spacing.sm,
    },
    authorText: {
      flex: 1,
    },
    authorName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    publishDate: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
    metaInfo: {
      alignItems: 'flex-end',
    },
    readingTime: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginBottom: 2,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginHorizontal: 2,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    tag: {
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    tagText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    moreTagsText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
    },
  });

export default BlogCard;