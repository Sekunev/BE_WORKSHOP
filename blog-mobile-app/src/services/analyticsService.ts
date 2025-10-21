import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';

interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
}

interface UserAnalytics {
  blogsRead: number;
  blogsLiked: number;
  blogsShared: number;
  authorsFollowed: number;
  sessionCount: number;
  totalTimeSpent: number; // in milliseconds
  lastActiveDate: string;
}

class AnalyticsService {
  private sessionStartTime: number | null = null;
  private events: AnalyticsEvent[] = [];

  // Initialize analytics
  async initialize(userId?: string): Promise<void> {
    try {
      this.sessionStartTime = Date.now();
      
      // Track session start
      await this.trackEvent('session_start', {
        platform: 'mobile',
        timestamp: new Date().toISOString(),
      }, userId);

      // Update session count
      await this.updateUserAnalytics(userId, { sessionCount: 1 });
      
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  // Track an event
  async trackEvent(
    event: string, 
    properties: Record<string, any> = {}, 
    userId?: string
  ): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: Date.now().toString(),
        event,
        properties,
        timestamp: new Date().toISOString(),
        userId,
      };

      // Add to local events array
      this.events.push(analyticsEvent);

      // Store locally
      await this.storeEvent(analyticsEvent);

      // Log for debugging
      console.log('Analytics event tracked:', event, properties);

      // TODO: Send to analytics service (Firebase Analytics, Mixpanel, etc.)
      // await this.sendToAnalyticsService(analyticsEvent);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Track blog read
  async trackBlogRead(blogId: string, blogTitle: string, userId?: string): Promise<void> {
    await this.trackEvent('blog_read', {
      blogId,
      blogTitle,
      readTime: new Date().toISOString(),
    }, userId);

    if (userId) {
      await this.updateUserAnalytics(userId, { blogsRead: 1 });
    }
  }

  // Track blog like
  async trackBlogLike(blogId: string, blogTitle: string, userId?: string): Promise<void> {
    await this.trackEvent('blog_liked', {
      blogId,
      blogTitle,
      likeTime: new Date().toISOString(),
    }, userId);

    if (userId) {
      await this.updateUserAnalytics(userId, { blogsLiked: 1 });
    }
  }

  // Track blog share
  async trackBlogShare(
    blogId: string, 
    blogTitle: string, 
    platform: string, 
    userId?: string
  ): Promise<void> {
    await this.trackEvent('blog_shared', {
      blogId,
      blogTitle,
      platform,
      shareTime: new Date().toISOString(),
    }, userId);

    if (userId) {
      await this.updateUserAnalytics(userId, { blogsShared: 1 });
    }
  }

  // Track author follow
  async trackAuthorFollow(authorId: string, authorName: string, userId?: string): Promise<void> {
    await this.trackEvent('author_followed', {
      authorId,
      authorName,
      followTime: new Date().toISOString(),
    }, userId);

    if (userId) {
      await this.updateUserAnalytics(userId, { authorsFollowed: 1 });
    }
  }

  // Track screen view
  async trackScreenView(screenName: string, userId?: string): Promise<void> {
    await this.trackEvent('screen_view', {
      screenName,
      viewTime: new Date().toISOString(),
    }, userId);
  }

  // Track search
  async trackSearch(query: string, resultsCount: number, userId?: string): Promise<void> {
    await this.trackEvent('search_performed', {
      query,
      resultsCount,
      searchTime: new Date().toISOString(),
    }, userId);
  }

  // Track app open
  async trackAppOpen(userId?: string): Promise<void> {
    await this.trackEvent('app_opened', {
      openTime: new Date().toISOString(),
    }, userId);
  }

  // Track app close
  async trackAppClose(userId?: string): Promise<void> {
    const sessionDuration = this.sessionStartTime 
      ? Date.now() - this.sessionStartTime 
      : 0;

    await this.trackEvent('app_closed', {
      closeTime: new Date().toISOString(),
      sessionDuration,
    }, userId);

    if (userId && sessionDuration > 0) {
      await this.updateUserAnalytics(userId, { totalTimeSpent: sessionDuration });
    }
  }

  // Store event locally
  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const existingEvents = await this.getStoredEvents();
      const updatedEvents = [event, ...existingEvents];
      
      // Keep only last 1000 events
      const trimmedEvents = updatedEvents.slice(0, 1000);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ANALYTICS_EVENTS,
        JSON.stringify(trimmedEvents)
      );
    } catch (error) {
      console.error('Error storing analytics event:', error);
    }
  }

  // Get stored events
  async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored events:', error);
      return [];
    }
  }

  // Update user analytics
  private async updateUserAnalytics(
    userId: string, 
    updates: Partial<UserAnalytics>
  ): Promise<void> {
    try {
      const currentAnalytics = await this.getUserAnalytics(userId);
      
      const updatedAnalytics: UserAnalytics = {
        blogsRead: currentAnalytics.blogsRead + (updates.blogsRead || 0),
        blogsLiked: currentAnalytics.blogsLiked + (updates.blogsLiked || 0),
        blogsShared: currentAnalytics.blogsShared + (updates.blogsShared || 0),
        authorsFollowed: currentAnalytics.authorsFollowed + (updates.authorsFollowed || 0),
        sessionCount: currentAnalytics.sessionCount + (updates.sessionCount || 0),
        totalTimeSpent: currentAnalytics.totalTimeSpent + (updates.totalTimeSpent || 0),
        lastActiveDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_ANALYTICS}_${userId}`,
        JSON.stringify(updatedAnalytics)
      );
    } catch (error) {
      console.error('Error updating user analytics:', error);
    }
  }

  // Get user analytics
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_ANALYTICS}_${userId}`);
      
      const defaultAnalytics: UserAnalytics = {
        blogsRead: 0,
        blogsLiked: 0,
        blogsShared: 0,
        authorsFollowed: 0,
        sessionCount: 0,
        totalTimeSpent: 0,
        lastActiveDate: new Date().toISOString(),
      };

      return stored ? { ...defaultAnalytics, ...JSON.parse(stored) } : defaultAnalytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        blogsRead: 0,
        blogsLiked: 0,
        blogsShared: 0,
        authorsFollowed: 0,
        sessionCount: 0,
        totalTimeSpent: 0,
        lastActiveDate: new Date().toISOString(),
      };
    }
  }

  // Get events by type
  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    try {
      const events = await this.getStoredEvents();
      return events.filter(event => event.event === eventType);
    } catch (error) {
      console.error('Error getting events by type:', error);
      return [];
    }
  }

  // Get events in date range
  async getEventsInDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    try {
      const events = await this.getStoredEvents();
      return events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting events in date range:', error);
      return [];
    }
  }

  // Clear all analytics data
  async clearAnalyticsData(userId?: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ANALYTICS_EVENTS);
      
      if (userId) {
        await AsyncStorage.removeItem(`${STORAGE_KEYS.USER_ANALYTICS}_${userId}`);
      }
      
      this.events = [];
      console.log('Analytics data cleared');
    } catch (error) {
      console.error('Error clearing analytics data:', error);
    }
  }

  // Export analytics data (for debugging or data export)
  async exportAnalyticsData(userId?: string): Promise<{
    events: AnalyticsEvent[];
    userAnalytics?: UserAnalytics;
  }> {
    try {
      const events = await this.getStoredEvents();
      const userAnalytics = userId ? await this.getUserAnalytics(userId) : undefined;
      
      return {
        events,
        userAnalytics,
      };
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      return { events: [] };
    }
  }

  // Send analytics to external service (placeholder)
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // TODO: Implement actual analytics service integration
      // Examples:
      // - Firebase Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics API
      
      console.log('Would send to analytics service:', event);
    } catch (error) {
      console.error('Error sending to analytics service:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;