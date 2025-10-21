import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { socialService } from '@/services/socialService';

interface LikeButtonProps {
  blogId: string;
  initialLikeCount: number;
  initialIsLiked?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  blogId,
  initialLikeCount,
  initialIsLiked = false,
  size = 'medium',
  showCount = true,
  onLikeChange,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Check if user has liked this blog
    if (user) {
      checkLikeStatus();
    }
  }, [user, blogId]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const hasLiked = await socialService.hasUserLikedBlog(blogId, user.id);
      setIsLiked(hasLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLikePress = async () => {
    if (!user) {
      showToast('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Animate button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

      // Optimistic update
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      // Call API
      if (newIsLiked) {
        await socialService.likeBlog(blogId, user.id);
        showToast('Blog beğenildi', 'success');
      } else {
        await socialService.unlikeBlog(blogId, user.id);
        showToast('Beğeni kaldırıldı', 'info');
      }

      // Notify parent component
      onLikeChange?.(newIsLiked, newLikeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      
      showToast('İşlem sırasında hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 22;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const formatLikeCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          opacity: isLoading ? 0.7 : 1,
        },
      ]}
      onPress={handleLikePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Icon
          name={isLiked ? 'favorite' : 'favorite-border'}
          size={getIconSize()}
          color={isLiked ? theme.colors.error : theme.colors.textSecondary}
        />
        {showCount && (
          <Text
            style={[
              styles.countText,
              {
                color: isLiked ? theme.colors.error : theme.colors.textSecondary,
                fontSize: getTextSize(),
                marginLeft: size === 'small' ? 4 : 6,
              },
            ]}
          >
            {formatLikeCount(likeCount)}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontWeight: '500',
  },
});

export default LikeButton;