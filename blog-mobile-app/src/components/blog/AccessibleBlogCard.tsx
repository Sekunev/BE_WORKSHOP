import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility, useGestureAccessibility } from '../../hooks/useAccessibility';
import { OptimizedImage } from '../ui/OptimizedImage';
import { SwipeableListItem } from '../ui/SwipeableListItem';
import { AccessibilityHelpers, buildAccessibilityProps } from '../../utils/accessibility';
import { Blog } from '../../types/blog';

interface AccessibleBlogCardProps {
  blog: Blog;
  onPress: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isOwner?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = 80;

export const AccessibleBlogCard: React.FC<AccessibleBlogCardProps> = ({
  blog,
  onPress,
  onLike,
  onShare,
  onBookmark,
  onDelete,
  showActions = true,
  isOwner = false,
}) => {
  const { theme } = useTheme();
  const { settings, announceForAccessibility } = useAccessibility();
  const { createAccessibleGesture } = useGestureAccessibility();

  // Create accessibility label for the blog card
  const blogAccessibilityLabel = AccessibilityHelpers.createBlogPostLabel(
    blog.title,
    blog.author.name,
    blog.readingTime,
    blog.likeCount
  );

  // Create swipe actions
  const leftActions = showActions ? [
    {
      text: 'Beğen',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      onPress: () => {
        onLike?.();
        announceForAccessibility('Blog beğenildi');
      },
      icon: <Text style={{ color: '#FFFFFF', fontSize: 18 }}>❤️</Text>,
    },
  ] : [];

  const rightActions = [
    ...(showActions ? [
      {
        text: 'Paylaş',
        color: '#FFFFFF',
        backgroundColor: '#2196F3',
        onPress: () => {
          onShare?.();
          announceForAccessibility('Blog paylaşım seçenekleri açıldı');
        },
        icon: <Text style={{ color: '#FFFFFF', fontSize: 18 }}>📤</Text>,
      },
      {
        text: 'Kaydet',
        color: '#FFFFFF',
        backgroundColor: '#FF9800',
        onPress: () => {
          onBookmark?.();
          announceForAccessibility('Blog kaydedildi');
        },
        icon: <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🔖</Text>,
      },
    ] : []),
    ...(isOwner && onDelete ? [
      {
        text: 'Sil',
        color: '#FFFFFF',
        backgroundColor: '#F44336',
        onPress: () => {
          onDelete();
          announceForAccessibility('Blog silindi');
        },
        icon: <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🗑️</Text>,
      },
    ] : []),
  ];

  // Create gesture accessibility props
  const gestureProps = createAccessibleGesture({
    onPress,
    onLongPress: showActions ? onShare : undefined,
    accessibilityLabel: blogAccessibilityLabel,
    accessibilityHint: 'Blog detaylarını görmek için dokunun',
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      minHeight: Math.max(100, 100 * settings.preferredFontScale), // Ensure minimum touch target
    },
    contentContainer: {
      flexDirection: 'row',
    },
    imageContainer: {
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 16 * settings.preferredFontScale,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      lineHeight: 22 * settings.preferredFontScale,
    },
    excerpt: {
      fontSize: 14 * settings.preferredFontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      marginBottom: 8,
      lineHeight: 20 * settings.preferredFontScale,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: 12 * settings.preferredFontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      marginRight: 12,
    },
    authorText: {
      fontSize: 12 * settings.preferredFontScale,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    categoryBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 4,
    },
    categoryText: {
      fontSize: 10 * settings.preferredFontScale,
      color: theme.colors.background,
      fontWeight: '500',
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    statText: {
      fontSize: 12 * settings.preferredFontScale,
      color: theme.colors.textSecondary || theme.colors.text,
      marginLeft: 4,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return AccessibilityHelpers.createDateLabel(date);
  };

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Blog Image */}
        {blog.featuredImage && (
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: blog.featuredImage }}
              style={{
                width: IMAGE_SIZE * settings.preferredFontScale,
                height: IMAGE_SIZE * settings.preferredFontScale,
                borderRadius: 8,
              }}
              maxWidth={IMAGE_SIZE * 2}
              maxHeight={IMAGE_SIZE * 2}
              accessibilityLabel={`${blog.title} blog yazısının kapak görseli`}
              priority="low"
            />
          </View>
        )}

        {/* Blog Content */}
        <View style={styles.textContainer}>
          <Text 
            style={styles.title}
            numberOfLines={2}
            {...buildAccessibilityProps({
              role: 'HEADING',
              label: blog.title,
            })}
          >
            {blog.title}
          </Text>

          {blog.excerpt && (
            <Text 
              style={styles.excerpt}
              numberOfLines={2}
              {...buildAccessibilityProps({
                role: 'TEXT',
                label: blog.excerpt,
              })}
            >
              {blog.excerpt}
            </Text>
          )}

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <Text 
              style={styles.authorText}
              {...buildAccessibilityProps({
                role: 'TEXT',
                label: `Yazar: ${blog.author.name}`,
              })}
            >
              {blog.author.name}
            </Text>
            <Text 
              style={styles.metaText}
              {...buildAccessibilityProps({
                role: 'TEXT',
                label: `Yayın tarihi: ${formatDate(blog.publishedAt || blog.createdAt)}`,
              })}
            >
              {formatDate(blog.publishedAt || blog.createdAt)}
            </Text>
          </View>

          {/* Category Badge */}
          {blog.category && (
            <View style={styles.categoryBadge}>
              <Text 
                style={styles.categoryText}
                {...buildAccessibilityProps({
                  role: 'TEXT',
                  label: `Kategori: ${blog.category}`,
                })}
              >
                {blog.category}
              </Text>
            </View>
          )}

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statText}>👁️</Text>
              <Text 
                style={styles.statText}
                {...buildAccessibilityProps({
                  role: 'TEXT',
                  label: `${blog.viewCount} görüntülenme`,
                })}
              >
                {blog.viewCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>❤️</Text>
              <Text 
                style={styles.statText}
                {...buildAccessibilityProps({
                  role: 'TEXT',
                  label: `${blog.likeCount} beğeni`,
                })}
              >
                {blog.likeCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>⏱️</Text>
              <Text 
                style={styles.statText}
                {...buildAccessibilityProps({
                  role: 'TEXT',
                  label: `${blog.readingTime} dakika okuma süresi`,
                })}
              >
                {blog.readingTime} dk
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // If reduce motion is enabled or no actions, use simple TouchableOpacity
  if (settings.isReduceMotionEnabled || (!showActions && !isOwner)) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={showActions ? onShare : undefined}
        activeOpacity={0.7}
        {...gestureProps}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Use SwipeableListItem for gesture support
  return (
    <SwipeableListItem
      leftActions={leftActions}
      rightActions={rightActions}
      onPress={onPress}
      onLongPress={showActions ? onShare : undefined}
      accessibilityLabel={blogAccessibilityLabel}
      accessibilityHint="Blog detaylarını görmek için dokunun, eylemler için kaydırın"
    >
      {renderContent()}
    </SwipeableListItem>
  );
};