import Share from 'react-native-share';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SocialInteraction, 
  ActivityFeedItem, 
  ShareOptions 
} from '@/types/notification';
import { Blog } from '@/types/blog';
import { User } from '@/types/auth';
import { STORAGE_KEYS } from '@/constants/storage';
import { store } from '@/store/store';
import { blogApi } from '@/store/api/blogApi';
import { analyticsService } from './analyticsService';

class SocialService {
  // Like a blog
  async likeBlog(blogId: string, userId: string): Promise<void> {
    try {
      // Optimistic update - update UI immediately
      this.recordSocialInteraction('like', userId, blogId);

      // Make API call
      await store.dispatch(
        blogApi.endpoints.likeBlog.initiate(blogId)
      ).unwrap();

      // Track analytics
      await analyticsService.trackBlogLike(blogId, 'Blog', userId);

      console.log('Blog liked successfully:', blogId);
    } catch (error) {
      console.error('Error liking blog:', error);
      // Revert optimistic update on error
      this.recordSocialInteraction('unlike', userId, blogId);
      throw error;
    }
  }

  // Unlike a blog
  async unlikeBlog(blogId: string, userId: string): Promise<void> {
    try {
      // Optimistic update
      this.recordSocialInteraction('unlike', userId, blogId);

      // Make API call (assuming there's an unlike endpoint)
      await store.dispatch(
        blogApi.endpoints.unlikeBlog.initiate(blogId)
      ).unwrap();

      console.log('Blog unliked successfully:', blogId);
    } catch (error) {
      console.error('Error unliking blog:', error);
      // Revert optimistic update on error
      this.recordSocialInteraction('like', userId, blogId);
      throw error;
    }
  }

  // Follow an author
  async followAuthor(authorId: string, userId: string): Promise<void> {
    try {
      // Record interaction
      this.recordSocialInteraction('follow', userId, authorId);

      // TODO: Make API call when backend supports it
      // await api.post(`/users/${authorId}/follow`);

      // Track analytics
      await analyticsService.trackAuthorFollow(authorId, 'Author', userId);

      console.log('Author followed successfully:', authorId);
    } catch (error) {
      console.error('Error following author:', error);
      // Revert on error
      this.recordSocialInteraction('unfollow', userId, authorId);
      throw error;
    }
  }

  // Unfollow an author
  async unfollowAuthor(authorId: string, userId: string): Promise<void> {
    try {
      // Record interaction
      this.recordSocialInteraction('unfollow', userId, authorId);

      // TODO: Make API call when backend supports it
      // await api.delete(`/users/${authorId}/follow`);

      console.log('Author unfollowed successfully:', authorId);
    } catch (error) {
      console.error('Error unfollowing author:', error);
      // Revert on error
      this.recordSocialInteraction('follow', userId, authorId);
      throw error;
    }
  }

  // Share a blog
  async shareBlog(blog: Blog, options?: Partial<ShareOptions>): Promise<void> {
    try {
      const shareOptions: ShareOptions = {
        title: options?.title || blog.title,
        message: options?.message || `${blog.title}\n\n${blog.excerpt || ''}`,
        url: options?.url || `https://yourblog.com/blog/${blog.slug}`,
        subject: options?.subject || `Check out this blog: ${blog.title}`,
      };

      // Record share interaction
      this.recordSocialInteraction('share', 'current_user', blog.id);

      // Show share dialog
      const result = await Share.open({
        title: shareOptions.title,
        message: shareOptions.message,
        url: shareOptions.url,
        subject: shareOptions.subject,
      });

      if (result.success) {
        console.log('Blog shared successfully:', blog.id);
        
        // Track share analytics
        this.trackShareAnalytics(blog.id, (result as any).app || 'unknown');
      }
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        console.error('Error sharing blog:', error);
        Alert.alert('Paylaşım Hatası', 'Blog paylaşılırken bir hata oluştu.');
      }
    }
  }

  // Share blog with specific platform
  async shareBlogToPlatform(blog: Blog, platform: 'whatsapp' | 'twitter' | 'facebook' | 'email'): Promise<void> {
    try {
      const shareUrl = `https://yourblog.com/blog/${blog.slug}`;
      const shareText = `${blog.title}\n\n${blog.excerpt || ''}`;

      let url = '';
      
      switch (platform) {
        case 'whatsapp':
          url = `whatsapp://send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
          break;
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'email':
          url = `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          break;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        
        // Record share interaction
        this.recordSocialInteraction('share', 'current_user', blog.id);
        
        // Track analytics
        this.trackShareAnalytics(blog.id, platform);
      } else {
        Alert.alert('Hata', `${platform} uygulaması bulunamadı.`);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      Alert.alert('Paylaşım Hatası', 'Blog paylaşılırken bir hata oluştu.');
    }
  }

  // Get share options for a blog
  getShareOptions(blog: Blog): any[] {
    return [
      {
        title: 'WhatsApp',
        icon: 'whatsapp',
        onPress: () => this.shareBlogToPlatform(blog, 'whatsapp'),
      },
      {
        title: 'Twitter',
        icon: 'twitter',
        onPress: () => this.shareBlogToPlatform(blog, 'twitter'),
      },
      {
        title: 'Facebook',
        icon: 'facebook',
        onPress: () => this.shareBlogToPlatform(blog, 'facebook'),
      },
      {
        title: 'E-posta',
        icon: 'email',
        onPress: () => this.shareBlogToPlatform(blog, 'email'),
      },
      {
        title: 'Diğer',
        icon: 'share',
        onPress: () => this.shareBlog(blog),
      },
    ];
  }

  // Record social interaction locally
  private async recordSocialInteraction(
    type: SocialInteraction['type'],
    userId: string,
    targetId: string
  ): Promise<void> {
    try {
      const interaction: SocialInteraction = {
        id: Date.now().toString(),
        type,
        userId,
        targetId,
        timestamp: new Date().toISOString(),
      };

      // Get existing interactions
      const existingInteractions = await this.getSocialInteractions();
      
      // Add new interaction
      const updatedInteractions = [interaction, ...existingInteractions];
      
      // Keep only last 1000 interactions
      const trimmedInteractions = updatedInteractions.slice(0, 1000);
      
      // Store updated interactions
      await AsyncStorage.setItem(
        STORAGE_KEYS.SOCIAL_INTERACTIONS,
        JSON.stringify(trimmedInteractions)
      );
    } catch (error) {
      console.error('Error recording social interaction:', error);
    }
  }

  // Get social interactions
  async getSocialInteractions(): Promise<SocialInteraction[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_INTERACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting social interactions:', error);
      return [];
    }
  }

  // Check if user has liked a blog
  async hasUserLikedBlog(blogId: string, userId: string): Promise<boolean> {
    try {
      const interactions = await this.getSocialInteractions();
      
      // Find the most recent like/unlike interaction for this blog
      const blogInteractions = interactions
        .filter(interaction => 
          interaction.targetId === blogId && 
          interaction.userId === userId &&
          (interaction.type === 'like' || interaction.type === 'unlike')
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (blogInteractions.length === 0) return false;
      
      return blogInteractions[0].type === 'like';
    } catch (error) {
      console.error('Error checking if user liked blog:', error);
      return false;
    }
  }

  // Check if user is following an author
  async isUserFollowingAuthor(authorId: string, userId: string): Promise<boolean> {
    try {
      const interactions = await this.getSocialInteractions();
      
      // Find the most recent follow/unfollow interaction for this author
      const authorInteractions = interactions
        .filter(interaction => 
          interaction.targetId === authorId && 
          interaction.userId === userId &&
          (interaction.type === 'follow' || interaction.type === 'unfollow')
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (authorInteractions.length === 0) return false;
      
      return authorInteractions[0].type === 'follow';
    } catch (error) {
      console.error('Error checking if user is following author:', error);
      return false;
    }
  }

  // Get activity feed
  async getActivityFeed(): Promise<ActivityFeedItem[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting activity feed:', error);
      return [];
    }
  }

  // Add activity to feed
  async addActivityToFeed(activity: Omit<ActivityFeedItem, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const activityItem: ActivityFeedItem = {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Get existing activities
      const existingActivities = await this.getActivityFeed();
      
      // Add new activity to the beginning
      const updatedActivities = [activityItem, ...existingActivities];
      
      // Keep only last 200 activities
      const trimmedActivities = updatedActivities.slice(0, 200);
      
      // Store updated activities
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVITY_FEED,
        JSON.stringify(trimmedActivities)
      );
    } catch (error) {
      console.error('Error adding activity to feed:', error);
    }
  }

  // Mark activity as read
  async markActivityAsRead(activityId: string): Promise<void> {
    try {
      const activities = await this.getActivityFeed();
      const updatedActivities = activities.map(activity =>
        activity.id === activityId
          ? { ...activity, read: true }
          : activity
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVITY_FEED,
        JSON.stringify(updatedActivities)
      );
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  }

  // Get unread activity count
  async getUnreadActivityCount(): Promise<number> {
    try {
      const activities = await this.getActivityFeed();
      return activities.filter(activity => !activity.read).length;
    } catch (error) {
      console.error('Error getting unread activity count:', error);
      return 0;
    }
  }

  // Track share analytics
  private async trackShareAnalytics(blogId: string, platform: string): Promise<void> {
    try {
      await analyticsService.trackBlogShare(blogId, 'Blog', platform);
      console.log('Share analytics tracked:', { blogId, platform, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error tracking share analytics:', error);
    }
  }

  // Get user's liked blogs
  async getUserLikedBlogs(userId: string): Promise<string[]> {
    try {
      const interactions = await this.getSocialInteractions();
      
      // Get all blog IDs that user has liked (and not subsequently unliked)
      const blogLikes = new Map<string, boolean>();
      
      interactions
        .filter(interaction => 
          interaction.userId === userId &&
          (interaction.type === 'like' || interaction.type === 'unlike')
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .forEach(interaction => {
          blogLikes.set(interaction.targetId, interaction.type === 'like');
        });

      return Array.from(blogLikes.entries())
        .filter(([_, isLiked]) => isLiked)
        .map(([blogId, _]) => blogId);
    } catch (error) {
      console.error('Error getting user liked blogs:', error);
      return [];
    }
  }

  // Get user's followed authors
  async getUserFollowedAuthors(userId: string): Promise<string[]> {
    try {
      const interactions = await this.getSocialInteractions();
      
      // Get all author IDs that user is following (and not subsequently unfollowed)
      const authorFollows = new Map<string, boolean>();
      
      interactions
        .filter(interaction => 
          interaction.userId === userId &&
          (interaction.type === 'follow' || interaction.type === 'unfollow')
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .forEach(interaction => {
          authorFollows.set(interaction.targetId, interaction.type === 'follow');
        });

      return Array.from(authorFollows.entries())
        .filter(([_, isFollowing]) => isFollowing)
        .map(([authorId, _]) => authorId);
    } catch (error) {
      console.error('Error getting user followed authors:', error);
      return [];
    }
  }

  // Clear all social data
  async clearAllSocialData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SOCIAL_INTERACTIONS,
        STORAGE_KEYS.ACTIVITY_FEED,
      ]);
    } catch (error) {
      console.error('Error clearing social data:', error);
    }
  }
}

export const socialService = new SocialService();
export default socialService;