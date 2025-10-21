import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '@/contexts/ThemeContext';
import {useCommonStyles} from '@/constants/commonStyles';

interface BlogDetailHeaderProps {
  title: string;
  onGoBack: () => void;
  onShare: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

const BlogDetailHeader = ({
  title,
  onGoBack,
  onShare,
  onBookmark,
  isBookmarked,
}: BlogDetailHeaderProps) => {
  const {theme} = useTheme();
  const commonStyles = useCommonStyles(theme);

  return (
    <LinearGradient
      colors={[theme.colors.surface.elevated, theme.colors.surface.elevated + '00']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.elevated} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, {backgroundColor: theme.colors.surface.primary}]}
          onPress={onGoBack}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[commonStyles.heading3, styles.title]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: theme.colors.surface.primary}]}
            onPress={onBookmark}
            activeOpacity={0.8}
          >
            <Icon
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={isBookmarked ? theme.colors.primary : theme.colors.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, {backgroundColor: theme.colors.surface.primary, marginLeft: 8}]}
            onPress={onShare}
            activeOpacity={0.8}
          >
            <Icon name="share" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BlogDetailHeader;