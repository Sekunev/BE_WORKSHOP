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

interface FollowButtonProps {
  authorId: string;
  authorName: string;
  initialIsFollowing?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outline';
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  authorId,
  authorName,
  initialIsFollowing = false,
  size = 'medium',
  variant = 'filled',
  onFollowChange,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Check if user is following this author
    if (user && authorId !== user.id) {
      checkFollowStatus();
    }
  }, [user, authorId]);

  const checkFollowStatus = async () => {
    if (!user) return;
    
    try {
      const isUserFollowing = await socialService.isUserFollowingAuthor(authorId, user.id);
      setIsFollowing(isUserFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowPress = async () => {
    if (!user) {
      showToast('Takip etmek için giriş yapmalısınız', 'warning');
      return;
    }

    if (user.id === authorId) {
      showToast('Kendinizi takip edemezsiniz', 'warning');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Animate button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const newIsFollowing = !isFollowing;

      // Optimistic update
      setIsFollowing(newIsFollowing);

      // Call API
      if (newIsFollowing) {
        await socialService.followAuthor(authorId, user.id);
        showToast(`${authorName} takip ediliyor`, 'success');
      } else {
        await socialService.unfollowAuthor(authorId, user.id);
        showToast(`${authorName} takip edilmiyor`, 'info');
      }

      // Notify parent component
      onFollowChange?.(newIsFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      
      // Revert optimistic update
      setIsFollowing(!isFollowing);
      
      showToast('İşlem sırasında hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 };
      case 'large':
        return { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 };
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

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = getButtonSize();
    
    if (variant === 'outline') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isFollowing ? theme.colors.textSecondary : theme.colors.primary,
      };
    }
    
    return {
      ...baseStyle,
      backgroundColor: isFollowing ? theme.colors.textSecondary : theme.colors.primary,
    };
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return isFollowing ? theme.colors.textSecondary : theme.colors.primary;
    }
    
    return theme.colors.surface;
  };

  const getButtonText = () => {
    return isFollowing ? 'Takip Ediliyor' : 'Takip Et';
  };

  const getButtonIcon = () => {
    return isFollowing ? 'person-remove' : 'person-add';
  };

  // Don't show follow button for the user's own profile
  if (user && user.id === authorId) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getButtonStyle(),
        {
          opacity: isLoading ? 0.7 : 1,
        },
      ]}
      onPress={handleFollowPress}
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
          name={getButtonIcon()}
          size={getIconSize()}
          color={getTextColor()}
        />
        <Text
          style={[
            styles.buttonText,
            {
              color: getTextColor(),
              fontSize: getTextSize(),
              marginLeft: size === 'small' ? 4 : 6,
            },
          ]}
        >
          {getButtonText()}
        </Text>
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
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default FollowButton;