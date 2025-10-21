import React from 'react';
import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';

interface BlogPreviewProps {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  content,
  excerpt,
  category,
  tags,
  featuredImage,
}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  // Convert HTML content to plain text for preview
  const plainContent = content.replace(/<[^>]*>/g, '');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Featured Image */}
      {featuredImage && (
        <Image source={{uri: featuredImage}} style={styles.featuredImage} />
      )}

      {/* Category */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title || 'Untitled Blog'}</Text>

      {/* Excerpt */}
      {excerpt && <Text style={styles.excerpt}>{excerpt}</Text>}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{plainContent || 'No content yet...'}</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    featuredImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
      resizeMode: 'cover',
    },
    categoryContainer: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      marginBottom: 12,
    },
    categoryText: {
      fontSize: 12,
      color: theme.colors.background,
      fontWeight: '500',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      lineHeight: 32,
    },
    excerpt: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 16,
      lineHeight: 24,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    tag: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    contentContainer: {
      marginTop: 8,
    },
    content: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
    },
  });

export default BlogPreview;