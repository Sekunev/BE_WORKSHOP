import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { blogService, Blog } from '@/services/blogService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

interface BlogDetailRouteParams {
  blogId: string;
}

const BlogDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { blogId } = route.params as BlogDetailRouteParams;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(blogId);
      setBlog(response.data.blog);

      // Görüntüleme sayısını artır
      await blogService.incrementViewCount(response.data.blog._id);
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
      Alert.alert('Hata', 'Blog yüklenemedi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;

    try {
      await blogService.likeBlog(blog._id);
      setLiked(!liked);
      setBlog({
        ...blog,
        likeCount: liked ? blog.likeCount - 1 : blog.likeCount + 1,
      });
    } catch (error) {
      Alert.alert('Hata', 'Beğeni işlemi başarısız');
    }
  };

  const handleShare = async () => {
    if (!blog) return;

    try {
      await Share.share({
        message: `${blog.title}\n\n${blog.excerpt}\n\nBlog uygulamasından paylaşıldı`,
        title: blog.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Blog yükleniyor...</Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Blog bulunamadı</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.category}>{blog.category}</Text>
        {blog.aiGenerated && (
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{blog.title}</Text>

      {/* Author Info */}
      <View style={styles.authorSection}>
        <Text style={styles.authorName}>{blog.author.name}</Text>
        <Text style={styles.publishDate}>
          {formatDate(blog.publishedAt || blog.createdAt)}
        </Text>
        <Text style={styles.readingTime}>
          {blog.readingTime} dakika okuma
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statText}>👁 {blog.viewCount}</Text>
        <Text style={styles.statText}>❤️ {blog.likeCount}</Text>
        <Text style={styles.statText}>💬 {blog.commentCount}</Text>
      </View>

      {/* Content */}
      <View style={styles.contentSection}>
        <Markdown style={markdownStyles}>
          {blog.content || blog.excerpt}
        </Markdown>
      </View>

      {/* Tags */}
      {blog.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Etiketler:</Text>
          <View style={styles.tagsContainer}>
            {blog.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, liked && styles.likedButton]}
          onPress={handleLike}
        >
          <Text style={[styles.actionButtonText, liked && styles.likedButtonText]}>
            {liked ? '❤️ Beğenildi' : '🤍 Beğen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Text style={styles.actionButtonText}>📤 Paylaş</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  aiTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    lineHeight: 32,
  },
  authorSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
  },
  publishDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  readingTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border.primary,
    marginBottom: SPACING.lg,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  contentSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  tagsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  tagsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  likedButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  likedButtonText: {
    color: COLORS.text.inverse,
  },
});

// Markdown stilleri
const markdownStyles = {
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  heading1: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heading2: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  heading3: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  strong: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
  },
  em: {
    fontStyle: 'italic',
    color: COLORS.text.secondary,
  },
  code_inline: {
    backgroundColor: COLORS.background.secondary,
    color: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.primary,
    padding: SPACING.md,
    borderRadius: 8,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'monospace',
    marginVertical: SPACING.sm,
  },
  blockquote: {
    backgroundColor: COLORS.background.secondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.sm,
    fontStyle: 'italic',
  },
  list_item: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  bullet_list: {
    marginVertical: SPACING.sm,
  },
  ordered_list: {
    marginVertical: SPACING.sm,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  hr: {
    backgroundColor: COLORS.border.primary,
    height: 1,
    marginVertical: SPACING.lg,
  },
};

export default BlogDetailScreen;