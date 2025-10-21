import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { ActivityFeedItem } from '@/types/notification';
import { socialService } from '@/services/socialService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ActivityFeedScreenProps {
  navigation: any;
}

export const ActivityFeedScreen: React.FC<ActivityFeedScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [activityList, count] = await Promise.all([
        socialService.getActivityFeed(),
        socialService.getUnreadActivityCount(),
      ]);
      
      setActivities(activityList);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading activities:', error);
      showToast('Aktiviteler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  }, []);

  const handleActivityPress = async (activity: ActivityFeedItem) => {
    try {
      // Mark as read if not already read
      if (!activity.read) {
        await socialService.markActivityAsRead(activity.id);
        setActivities(prev =>
          prev.map(a =>
            a.id === activity.id ? { ...a, read: true } : a
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on activity type
      if (activity.target.type === 'blog') {
        navigation.navigate('BlogDetail', { slug: activity.target.id });
      } else if (activity.target.type === 'user') {
        navigation.navigate('AuthorProfile', { authorId: activity.target.id });
      }
    } catch (error) {
      console.error('Error handling activity press:', error);
      showToast('Aktivite açılırken hata oluştu', 'error');
    }
  };

  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'blog_published':
        return 'article';
      case 'blog_liked':
        return 'favorite';
      case 'author_followed':
        return 'person-add';
      case 'blog_shared':
        return 'share';
      default:
        return 'notifications';
    }
  };

  const getActivityColor = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'blog_published':
        return theme.colors.primary;
      case 'blog_liked':
        return theme.colors.error;
      case 'author_followed':
        return theme.colors.success;
      case 'blog_shared':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getActivityText = (activity: ActivityFeedItem): string => {
    switch (activity.type) {
      case 'blog_published':
        return `${activity.actor.name} yeni bir blog yayınladı: "${activity.target.title}"`;
      case 'blog_liked':
        return `${activity.actor.name} blogunuzu beğendi: "${activity.target.title}"`;
      case 'author_followed':
        return `${activity.actor.name} sizi takip etmeye başladı`;
      case 'blog_shared':
        return `${activity.actor.name} blogunuzu paylaştı: "${activity.target.title}"`;
      default:
        return 'Yeni aktivite';
    }
  };

  const renderActivityItem = ({ item }: { item: ActivityFeedItem }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        {
          backgroundColor: item.read ? theme.colors.surface : theme.colors.primaryLight,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleActivityPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          {/* Actor Avatar */}
          <View style={styles.avatarContainer}>
            {item.actor.avatar ? (
              <Image
                source={{ uri: item.actor.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.border }]}>
                <Icon name="person" size={20} color={theme.colors.textSecondary} />
              </View>
            )}
            
            {/* Activity Type Icon */}
            <View style={[styles.activityTypeIcon, { backgroundColor: getActivityColor(item.type) }]}>
              <Icon
                name={getActivityIcon(item.type)}
                size={12}
                color={theme.colors.surface}
              />
            </View>
            
            {/* Unread Indicator */}
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
          
          {/* Activity Text */}
          <View style={styles.activityText}>
            <Text
              style={[
                styles.activityDescription,
                {
                  color: theme.colors.text,
                  fontWeight: item.read ? '400' : '600',
                },
              ]}
              numberOfLines={3}
            >
              {getActivityText(item)}
            </Text>
            <Text
              style={[
                styles.activityTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {formatDistanceToNow(new Date(item.timestamp), {
                addSuffix: true,
                locale: tr,
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="timeline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Henüz aktivite yok
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
        Sosyal etkileşimleriniz ve aktiviteleriniz burada görünecek
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Aktivite Akışı
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.unreadBadgeText, { color: theme.colors.surface }]}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.headerDescription, { color: theme.colors.textSecondary }]}>
        Takip ettiğiniz yazarların ve bloglarınızın aktiviteleri
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Aktiviteler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={activities.length === 0 ? styles.emptyContentContainer : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTypeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityText: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 12,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ActivityFeedScreen;