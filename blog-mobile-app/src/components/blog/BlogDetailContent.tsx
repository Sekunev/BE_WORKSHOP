import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Blog} from '@/types/blog';
import {useTheme} from '@/contexts/ThemeContext';
import {useCommonStyles} from '@/constants/commonStyles';
import {formatDate, formatReadingTime} from '@/utils/formatters';

interface BlogDetailContentProps {
  blog: Blog;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const BlogDetailContent = ({blog}: BlogDetailContentProps) => {
  const {theme} = useTheme();
  const commonStyles = useCommonStyles(theme);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Extract images from markdown content for gallery
  const extractImages = (content: string): {url: string}[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: {url: string}[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      images.push({url: match[1]});
    }

    return images;
  };

  const images = extractImages(blog.content);

  const handleImagePress = (imageUrl: string) => {
    const index = images.findIndex(img => img.url === imageUrl);
    setSelectedImageIndex(index >= 0 ? index : 0);
    setImageViewerVisible(true);
  };

  // Custom markdown styles
  const markdownStyles = {
    body: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    heading1: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    heading2: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    heading3: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    paragraph: {
      marginBottom: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      color: theme.colors.text.primary,
    },
    strong: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    em: {
      fontStyle: 'italic' as const,
      color: theme.colors.text.secondary,
    },
    code_inline: {
      backgroundColor: theme.colors.surface.secondary,
      color: theme.colors.primary,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface.secondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: 'monospace',
    },
    blockquote: {
      backgroundColor: theme.colors.surface.secondary,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      paddingLeft: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginVertical: theme.spacing.sm,
      fontStyle: 'italic',
    },
    list_item: {
      marginBottom: theme.spacing.xs,
    },
    bullet_list: {
      marginBottom: theme.spacing.md,
    },
    ordered_list: {
      marginBottom: theme.spacing.md,
    },
    image: {
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    table: {
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.md,
    },
    th: {
      backgroundColor: theme.colors.surface.secondary,
      padding: theme.spacing.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    td: {
      padding: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.primary,
    },
  };

  return (
    <View style={styles.container}>
      {/* Featured Image */}
      {blog.featuredImage && (
        <TouchableOpacity
          onPress={() => handleImagePress(blog.featuredImage!)}
          activeOpacity={0.9}
        >
          <Image
            source={{uri: blog.featuredImage}}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Icon name="zoom-in" size={24} color="white" />
          </View>
        </TouchableOpacity>
      )}

      {/* Blog Header Info */}
      <View style={[commonStyles.paddingHorizontalMd, styles.headerInfo]}>
        <Text style={[commonStyles.heading1, styles.title]}>
          {blog.title}
        </Text>

        {blog.excerpt && (
          <Text style={[commonStyles.bodyLarge, styles.excerpt]}>
            {blog.excerpt}
          </Text>
        )}

        {/* Author and Meta Info */}
        <View style={styles.metaInfo}>
          <View style={styles.authorInfo}>
            {blog.author.avatar && (
              <Image
                source={{uri: blog.author.avatar}}
                style={styles.authorAvatar}
              />
            )}
            <View style={styles.authorDetails}>
              <Text style={[commonStyles.body, styles.authorName]}>
                {blog.author.name}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[commonStyles.bodySmall, styles.metaText]}>
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </Text>
                <Text style={[commonStyles.bodySmall, styles.metaDivider]}>
                  •
                </Text>
                <Text style={[commonStyles.bodySmall, styles.metaText]}>
                  {formatReadingTime(blog.readingTime)}
                </Text>
                <Text style={[commonStyles.bodySmall, styles.metaDivider]}>
                  •
                </Text>
                <Text style={[commonStyles.bodySmall, styles.metaText]}>
                  {blog.viewCount} görüntülenme
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category and Tags */}
        <View style={styles.tagsContainer}>
          <View style={[styles.categoryTag, {backgroundColor: theme.colors.primary + '20'}]}>
            <Text style={[styles.categoryText, {color: theme.colors.primary}]}>
              {blog.category}
            </Text>
          </View>
          
          {blog.tags.map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, {backgroundColor: theme.colors.surface.secondary}]}
            >
              <Text style={[styles.tagText, {color: theme.colors.text.secondary}]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Blog Content */}
      <View style={[commonStyles.paddingHorizontalMd, styles.content]}>
        <Markdown
          style={markdownStyles}
          onLinkPress={(url: string) => {
            // Handle link press - could open in browser or in-app browser
            console.log('Link pressed:', url);
            return false;
          }}
          rules={{
            image: (node: any, children: any, parent: any, styles: any) => (
              <TouchableOpacity
                key={node.key}
                onPress={() => handleImagePress(node.attributes.src)}
                activeOpacity={0.9}
              >
                <Image
                  source={{uri: node.attributes.src}}
                  style={[styles.image, {width: SCREEN_WIDTH - 32, height: 200}]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ),
          }}
        >
          {blog.content}
        </Markdown>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={images}
          index={selectedImageIndex}
          onSwipeDown={() => setImageViewerVisible(false)}
          enableSwipeDown={true}
          backgroundColor="rgba(0,0,0,0.9)"
          renderIndicator={(currentIndex?: number, allSize?: number) => (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>
                {(currentIndex || 0) + 1} / {allSize || 0}
              </Text>
            </View>
          )}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageViewerVisible(false)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featuredImage: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    paddingTop: 24,
  },
  title: {
    marginBottom: 12,
  },
  excerpt: {
    marginBottom: 20,
    fontStyle: 'italic',
  },
  metaInfo: {
    marginBottom: 20,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  metaDivider: {
    marginHorizontal: 8,
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
  },
  content: {
    paddingBottom: 24,
  },
  imageIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  imageIndicatorText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default BlogDetailContent;