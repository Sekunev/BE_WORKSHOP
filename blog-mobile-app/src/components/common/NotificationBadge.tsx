import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { notificationService } from '@/services/notificationService';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 'medium',
  showZero = false,
}) => {
  const { theme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, borderRadius: 8 };
      case 'large':
        return { width: 24, height: 24, borderRadius: 12 };
      default:
        return { width: 20, height: 20, borderRadius: 10 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  const formatCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        getBadgeSize(),
        { backgroundColor: theme.colors.error },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: theme.colors.surface,
            fontSize: getTextSize(),
          },
        ]}
      >
        {formatCount(unreadCount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    paddingHorizontal: 2,
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationBadge;