import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';
import Skeleton, {SkeletonAvatar} from '@/components/ui/Skeleton';

interface BlogCardSkeletonProps {
  style?: ViewStyle;
  showImage?: boolean;
}

const BlogCardSkeleton: React.FC<BlogCardSkeletonProps> = ({
  style,
  showImage = true,
}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Featured Image Skeleton */}
      {showImage && (
        <View style={styles.imageContainer}>
          <Skeleton height={200} width="100%" />
        </View>
      )}

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Category Skeleton */}
        <Skeleton height={14} width="25%" style={styles.category} />

        {/* Title Skeleton */}
        <View style={styles.titleContainer}>
          <Skeleton height={20} width="90%" />
          <Skeleton height={20} width="70%" style={{marginTop: theme.spacing.xs}} />
        </View>

        {/* Excerpt Skeleton */}
        <View style={styles.excerptContainer}>
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="85%" style={{marginTop: theme.spacing.xs}} />
          <Skeleton height={16} width="60%" style={{marginTop: theme.spacing.xs}} />
        </View>

        {/* Footer Skeleton */}
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <SkeletonAvatar size={32} />
            <View style={styles.authorText}>
              <Skeleton height={14} width="80%" />
              <Skeleton height={12} width="60%" style={{marginTop: 4}} />
            </View>
          </View>

          <View style={styles.metaInfo}>
            <Skeleton height={12} width={60} />
            <Skeleton height={12} width={80} style={{marginTop: 2}} />
          </View>
        </View>

        {/* Tags Skeleton */}
        <View style={styles.tagsContainer}>
          <Skeleton height={24} width={60} borderRadius={theme.borderRadius.full} />
          <Skeleton 
            height={24} 
            width={80} 
            borderRadius={theme.borderRadius.full}
            style={{marginLeft: theme.spacing.xs}}
          />
          <Skeleton 
            height={24} 
            width={70} 
            borderRadius={theme.borderRadius.full}
            style={{marginLeft: theme.spacing.xs}}
          />
        </View>
      </View>
    </View>
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
    content: {
      padding: theme.spacing.md,
    },
    category: {
      marginBottom: theme.spacing.sm,
    },
    titleContainer: {
      marginBottom: theme.spacing.sm,
    },
    excerptContainer: {
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
    authorText: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    metaInfo: {
      alignItems: 'flex-end',
    },
    tagsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default BlogCardSkeleton;