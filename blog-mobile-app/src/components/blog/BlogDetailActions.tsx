import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Blog} from '@/types/blog';
import {useTheme} from '@/contexts/ThemeContext';
import {useCommonStyles} from '@/constants/commonStyles';

interface BlogDetailActionsProps {
  blog: Blog;
  onLike: () => void;
  onShare: () => void;
  onBookmark: () => void;
  isLiking: boolean;
  isBookmarked: boolean;
}

const BlogDetailActions = ({
  blog,
  onLike,
  onShare,
  onBookmark,
  isLiking,
  isBookmarked,
}: BlogDetailActionsProps) => {
  const {theme} = useTheme();
  const commonStyles = useCommonStyles(theme);

  const ActionButton = ({
    icon,
    label,
    count,
    onPress,
    isActive = false,
    isLoading = false,
    activeColor = theme.colors.primary,
  }: {
    icon: string;
    label: string;
    count?: number;
    onPress: () => void;
    isActive?: boolean;
    isLoading?: boolean;
    activeColor?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: theme.colors.surface.secondary,
          borderColor: isActive ? activeColor : theme.colors.border.primary,
        },
        isActive && {backgroundColor: activeColor + '10'},
      ]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <Icon
          name={icon}
          size={24}
          color={isActive ? activeColor : theme.colors.text.secondary}
        />
        <View style={styles.actionTextContainer}>
          <Text
            style={[
              styles.actionLabel,
              {color: isActive ? activeColor : theme.colors.text.secondary},
            ]}
          >
            {label}
          </Text>
          {count !== undefined && (
            <Text
              style={[
                styles.actionCount,
                {color: isActive ? activeColor : theme.colors.text.tertiary},
              ]}
            >
              {count}
            </Text>
          )}
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Icon name="refresh" size={16} color={theme.colors.text.tertiary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background.primary}]}>
      <View style={styles.divider} />
      
      <View style={styles.actionsRow}>
        <ActionButton
          icon="favorite"
          label="Beğen"
          count={blog.likeCount}
          onPress={onLike}
          isActive={false} // TODO: Implement liked state from API
          isLoading={isLiking}
          activeColor={theme.colors.error}
        />

        <ActionButton
          icon={isBookmarked ? 'bookmark' : 'bookmark-border'}
          label="Kaydet"
          onPress={onBookmark}
          isActive={isBookmarked}
        />

        <ActionButton
          icon="share"
          label="Paylaş"
          onPress={onShare}
        />
      </View>

      {/* Additional Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="visibility" size={16} color={theme.colors.text.tertiary} />
          <Text style={[styles.statText, {color: theme.colors.text.tertiary}]}>
            {blog.viewCount} görüntülenme
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="schedule" size={16} color={theme.colors.text.tertiary} />
          <Text style={[styles.statText, {color: theme.colors.text.tertiary}]}>
            {blog.readingTime} dk okuma
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    marginLeft: 8,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionCount: {
    fontSize: 11,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default BlogDetailActions;