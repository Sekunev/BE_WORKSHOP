// Notification related types

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
  blogId?: string;
  authorId?: string;
}

export type NotificationType = 
  | 'new_blog'
  | 'blog_liked'
  | 'blog_commented'
  | 'author_followed'
  | 'system'
  | 'general';

export interface NotificationPreferences {
  newBlogs: boolean;
  blogLikes: boolean;
  blogComments: boolean;
  authorFollows: boolean;
  systemNotifications: boolean;
  generalNotifications: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal';
  channelId?: string;
}

export interface NotificationState {
  notifications: NotificationData[];
  preferences: NotificationPreferences;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'not-determined';
}

export interface SocialInteraction {
  id: string;
  type: 'like' | 'unlike' | 'follow' | 'unfollow' | 'share';
  userId: string;
  targetId: string; // blogId or authorId
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'blog_published' | 'blog_liked' | 'author_followed' | 'blog_shared';
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    title?: string;
    type: 'blog' | 'user';
  };
  timestamp: string;
  read: boolean;
}

export interface ShareOptions {
  title: string;
  message: string;
  url: string;
  subject?: string;
}