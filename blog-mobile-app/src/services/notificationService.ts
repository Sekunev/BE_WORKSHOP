import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  NotificationData, 
  NotificationPreferences, 
  PushNotificationPayload,
  NotificationType 
} from '@/types/notification';
import { STORAGE_KEYS } from '@/constants/storage';

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeNotifications();
  }

  // Initialize notification service
  async initializeNotifications(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Configure push notifications
      this.configurePushNotifications();

      // Request permissions
      await this.requestPermissions();

      // Get FCM token
      await this.getFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Configure push notifications
  private configurePushNotifications(): void {
    PushNotification.configure({
      onRegister: (token: any) => {
        console.log('Push notification token:', token);
      },

      onNotification: (notification: any) => {
        console.log('Local notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }

        // Call required on iOS only
        if (Platform.OS === 'ios') {
          (notification as any).finish('UIBackgroundFetchResultNoData');
        }
      },

      onAction: (notification: any) => {
        console.log('Notification action received:', notification.action);
      },

      onRegistrationError: (err: any) => {
        console.error('Push notification registration error:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }
  }

  // Create notification channels for Android
  private createNotificationChannels(): void {
    const channels = [
      {
        channelId: 'blog_notifications',
        channelName: 'Blog Notifications',
        channelDescription: 'Notifications for new blogs and updates',
        importance: Importance.HIGH,
        vibrate: true,
      },
      {
        channelId: 'social_notifications',
        channelName: 'Social Notifications',
        channelDescription: 'Notifications for likes, follows, and social interactions',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      {
        channelId: 'system_notifications',
        channelName: 'System Notifications',
        channelDescription: 'System and app notifications',
        importance: Importance.LOW,
        vibrate: false,
      },
    ];

    channels.forEach(channel => {
      PushNotification.createChannel(channel, (created: boolean) => {
        console.log(`Channel ${channel.channelId} created:`, created);
      });
    });
  }

  // Request notification permissions
  async requestPermissions(): Promise<'granted' | 'denied' | 'not-determined'> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled ? 'granted' : 'denied';
      } else {
        // Android 13+ requires explicit permission
        if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
        }
        return 'granted'; // Android < 13 doesn't require explicit permission
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return 'denied';
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) return this.fcmToken;

      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Store token locally
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
      
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Setup message handlers
  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      await this.handleBackgroundMessage(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Message received in foreground!', remoteMessage);
      await this.handleForegroundMessage(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    });
  }

  // Handle background message
  private async handleBackgroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      // Store notification for later display
      await this.storeNotification(remoteMessage);
      
      // Show local notification if needed
      this.showLocalNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data ? remoteMessage.data as Record<string, any> : undefined,
      });
    } catch (error) {
      console.error('Error handling background message:', error);
    }
  }

  // Handle foreground message
  private async handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      // Store notification
      await this.storeNotification(remoteMessage);
      
      // Show local notification in foreground
      this.showLocalNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data ? remoteMessage.data as Record<string, any> : undefined,
      });
    } catch (error) {
      console.error('Error handling foreground message:', error);
    }
  }

  // Show local notification
  showLocalNotification(payload: PushNotificationPayload): void {
    const channelId = this.getChannelId(payload.data?.type);
    
    PushNotification.localNotification({
      title: payload.title,
      message: payload.body,
      playSound: true,
      soundName: payload.sound || 'default',
      importance: payload.priority === 'high' ? 'high' : 'default',
      priority: payload.priority === 'high' ? 'high' : 'default',
      channelId,
      userInfo: payload.data,
    });
  }

  // Get appropriate channel ID based on notification type
  private getChannelId(type?: string): string {
    switch (type) {
      case 'new_blog':
      case 'blog_liked':
      case 'blog_commented':
        return 'blog_notifications';
      case 'author_followed':
        return 'social_notifications';
      case 'system':
        return 'system_notifications';
      default:
        return 'blog_notifications';
    }
  }

  // Handle notification tap
  private handleNotificationTap(notification: any): void {
    try {
      const data = notification.data || notification.userInfo;
      
      if (data?.blogId) {
        // Navigate to blog detail
        this.navigateToBlog(data.blogId);
      } else if (data?.authorId) {
        // Navigate to author profile
        this.navigateToAuthor(data.authorId);
      } else if (data?.screen) {
        // Navigate to specific screen
        this.navigateToScreen(data.screen);
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  // Navigation helpers (to be implemented with navigation service)
  private navigateToBlog(blogId: string): void {
    // TODO: Implement navigation to blog detail
    console.log('Navigate to blog:', blogId);
  }

  private navigateToAuthor(authorId: string): void {
    // TODO: Implement navigation to author profile
    console.log('Navigate to author:', authorId);
  }

  private navigateToScreen(screen: string): void {
    // TODO: Implement navigation to specific screen
    console.log('Navigate to screen:', screen);
  }

  // Store notification locally
  private async storeNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      const notification: NotificationData = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        type: (remoteMessage.data?.type as NotificationType) || 'general',
        data: remoteMessage.data,
        timestamp: new Date().toISOString(),
        read: false,
        blogId: remoteMessage.data?.blogId,
        authorId: remoteMessage.data?.authorId,
      };

      // Get existing notifications
      const existingNotifications = await this.getStoredNotifications();
      
      // Add new notification to the beginning
      const updatedNotifications = [notification, ...existingNotifications];
      
      // Keep only last 100 notifications
      const trimmedNotifications = updatedNotifications.slice(0, 100);
      
      // Store updated notifications
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(trimmedNotifications)
      );
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Get stored notifications
  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,
      }));

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      const defaultPreferences: NotificationPreferences = {
        newBlogs: true,
        blogLikes: true,
        blogComments: true,
        authorFollows: true,
        systemNotifications: true,
        generalNotifications: true,
        pushEnabled: true,
        emailEnabled: false,
      };

      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        newBlogs: true,
        blogLikes: true,
        blogComments: true,
        authorFollows: true,
        systemNotifications: true,
        generalNotifications: true,
        pushEnabled: true,
        emailEnabled: false,
      };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const currentPreferences = await this.getNotificationPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(updatedPreferences)
      );

      // If push notifications are disabled, unsubscribe from topics
      if (!updatedPreferences.pushEnabled) {
        await this.unsubscribeFromAllTopics();
      } else {
        await this.subscribeToTopics(updatedPreferences);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Subscribe to FCM topics based on preferences
  private async subscribeToTopics(preferences: NotificationPreferences): Promise<void> {
    try {
      if (preferences.newBlogs) {
        await messaging().subscribeToTopic('new_blogs');
      }
      if (preferences.systemNotifications) {
        await messaging().subscribeToTopic('system_notifications');
      }
      if (preferences.generalNotifications) {
        await messaging().subscribeToTopic('general_notifications');
      }
    } catch (error) {
      console.error('Error subscribing to topics:', error);
    }
  }

  // Unsubscribe from all FCM topics
  private async unsubscribeFromAllTopics(): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic('new_blogs');
      await messaging().unsubscribeFromTopic('system_notifications');
      await messaging().unsubscribeFromTopic('general_notifications');
    } catch (error) {
      console.error('Error unsubscribing from topics:', error);
    }
  }

  // Send FCM token to server
  async sendTokenToServer(userId: string): Promise<void> {
    try {
      const token = await this.getFCMToken();
      if (!token) return;

      // TODO: Implement API call to send token to server
      console.log('Sending FCM token to server for user:', userId, token);
      
      // Example API call:
      // await api.post('/users/fcm-token', { token, userId });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Remove FCM token from server
  async removeTokenFromServer(userId: string): Promise<void> {
    try {
      const token = await this.getFCMToken();
      if (!token) return;

      // TODO: Implement API call to remove token from server
      console.log('Removing FCM token from server for user:', userId);
      
      // Example API call:
      // await api.delete('/users/fcm-token', { data: { token, userId } });
    } catch (error) {
      console.error('Error removing token from server:', error);
    }
  }

  // Check permission status
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'not-determined'> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().hasPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled ? 'granted' : 'denied';
      } else {
        // For Android, check if notifications are enabled
        // This is a simplified check - you might want to use a more robust solution
        return 'granted';
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
      return 'not-determined';
    }
  }

  // Show permission request dialog
  async showPermissionDialog(): Promise<void> {
    Alert.alert(
      'Bildirim İzni',
      'Yeni blog yazıları ve önemli güncellemelerden haberdar olmak için bildirim izni verin.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'İzin Ver',
          onPress: () => this.requestPermissions(),
        },
      ]
    );
  }
}

export const notificationService = new NotificationService();
export default notificationService;