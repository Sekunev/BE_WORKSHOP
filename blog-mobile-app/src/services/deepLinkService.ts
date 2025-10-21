import { Linking, Alert } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

interface DeepLinkData {
  screen?: string;
  params?: Record<string, any>;
  blogId?: string;
  authorId?: string;
  category?: string;
  tag?: string;
}

class DeepLinkService {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private pendingLink: string | null = null;

  // Set navigation reference
  setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
    
    // Process pending link if any
    if (this.pendingLink) {
      this.handleDeepLink(this.pendingLink);
      this.pendingLink = null;
    }
  }

  // Initialize deep linking
  async initialize() {
    try {
      // Check if app was opened from a deep link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('App opened with initial URL:', initialUrl);
        this.handleDeepLink(initialUrl);
      }

      // Listen for incoming deep links
      const subscription = Linking.addEventListener('url', (event) => {
        console.log('Deep link received:', event.url);
        this.handleDeepLink(event.url);
      });

      return subscription;
    } catch (error) {
      console.error('Error initializing deep linking:', error);
    }
  }

  // Handle deep link
  private handleDeepLink(url: string) {
    try {
      const linkData = this.parseDeepLink(url);
      
      if (!linkData) {
        console.warn('Invalid deep link format:', url);
        return;
      }

      // If navigation is not ready, store the link for later
      if (!this.navigationRef?.isReady()) {
        this.pendingLink = url;
        return;
      }

      this.navigateFromDeepLink(linkData);
    } catch (error) {
      console.error('Error handling deep link:', error);
      Alert.alert('Hata', 'Link açılırken bir hata oluştu.');
    }
  }

  // Parse deep link URL
  private parseDeepLink(url: string): DeepLinkData | null {
    try {
      // Expected formats:
      // blogapp://blog/[slug]
      // blogapp://author/[id]
      // blogapp://category/[name]
      // blogapp://tag/[name]
      // blogapp://notifications
      // blogapp://profile
      // https://yourblog.com/blog/[slug]
      // https://yourblog.com/author/[id]

      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);

      if (pathSegments.length === 0) {
        return { screen: 'Home' };
      }

      const [type, identifier] = pathSegments;

      switch (type) {
        case 'blog':
          if (identifier) {
            return {
              screen: 'BlogDetail',
              params: { slug: identifier },
              blogId: identifier,
            };
          }
          return { screen: 'BlogList' };

        case 'author':
          if (identifier) {
            return {
              screen: 'AuthorProfile',
              params: { authorId: identifier },
              authorId: identifier,
            };
          }
          break;

        case 'category':
          if (identifier) {
            return {
              screen: 'BlogList',
              params: { category: decodeURIComponent(identifier) },
              category: identifier,
            };
          }
          break;

        case 'tag':
          if (identifier) {
            return {
              screen: 'BlogList',
              params: { tag: decodeURIComponent(identifier) },
              tag: identifier,
            };
          }
          break;

        case 'notifications':
          return { screen: 'NotificationHistory' };

        case 'profile':
          return { screen: 'Profile' };

        case 'settings':
          return { screen: 'Settings' };

        case 'create':
          return { screen: 'CreateBlog' };

        default:
          console.warn('Unknown deep link type:', type);
          break;
      }

      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  // Navigate based on deep link data
  private navigateFromDeepLink(linkData: DeepLinkData) {
    if (!this.navigationRef) {
      console.warn('Navigation ref not available');
      return;
    }

    try {
      if (linkData.screen) {
        if (linkData.params) {
          this.navigationRef.navigate(linkData.screen, linkData.params);
        } else {
          this.navigationRef.navigate(linkData.screen);
        }
      }
    } catch (error) {
      console.error('Error navigating from deep link:', error);
      Alert.alert('Hata', 'Sayfa açılırken bir hata oluştu.');
    }
  }

  // Generate deep link for sharing
  generateDeepLink(type: string, identifier?: string, params?: Record<string, any>): string {
    const baseUrl = 'https://yourblog.com';
    
    switch (type) {
      case 'blog':
        return identifier ? `${baseUrl}/blog/${identifier}` : `${baseUrl}/blogs`;
      
      case 'author':
        return identifier ? `${baseUrl}/author/${identifier}` : `${baseUrl}/authors`;
      
      case 'category':
        return identifier ? `${baseUrl}/category/${encodeURIComponent(identifier)}` : `${baseUrl}/categories`;
      
      case 'tag':
        return identifier ? `${baseUrl}/tag/${encodeURIComponent(identifier)}` : `${baseUrl}/tags`;
      
      case 'notifications':
        return `${baseUrl}/notifications`;
      
      case 'profile':
        return `${baseUrl}/profile`;
      
      default:
        return baseUrl;
    }
  }

  // Generate app scheme deep link
  generateAppDeepLink(type: string, identifier?: string): string {
    const scheme = 'blogapp://';
    
    switch (type) {
      case 'blog':
        return identifier ? `${scheme}blog/${identifier}` : `${scheme}blogs`;
      
      case 'author':
        return identifier ? `${scheme}author/${identifier}` : `${scheme}authors`;
      
      case 'category':
        return identifier ? `${scheme}category/${encodeURIComponent(identifier)}` : `${scheme}categories`;
      
      case 'tag':
        return identifier ? `${scheme}tag/${encodeURIComponent(identifier)}` : `${scheme}tags`;
      
      case 'notifications':
        return `${scheme}notifications`;
      
      case 'profile':
        return `${scheme}profile`;
      
      default:
        return scheme;
    }
  }

  // Check if URL can be opened
  async canOpenURL(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error('Error checking if URL can be opened:', error);
      return false;
    }
  }

  // Open external URL
  async openURL(url: string): Promise<void> {
    try {
      const canOpen = await this.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Bu link açılamıyor.');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Hata', 'Link açılırken bir hata oluştu.');
    }
  }

  // Navigate to blog
  navigateToBlog(blogId: string, params?: Record<string, any>) {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('BlogDetail', { slug: blogId, ...params });
    } catch (error) {
      console.error('Error navigating to blog:', error);
    }
  }

  // Navigate to author profile
  navigateToAuthor(authorId: string, params?: Record<string, any>) {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('AuthorProfile', { authorId, ...params });
    } catch (error) {
      console.error('Error navigating to author:', error);
    }
  }

  // Navigate to category
  navigateToCategory(category: string, params?: Record<string, any>) {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('BlogList', { category, ...params });
    } catch (error) {
      console.error('Error navigating to category:', error);
    }
  }

  // Navigate to tag
  navigateToTag(tag: string, params?: Record<string, any>) {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('BlogList', { tag, ...params });
    } catch (error) {
      console.error('Error navigating to tag:', error);
    }
  }

  // Navigate to notifications
  navigateToNotifications() {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('NotificationHistory');
    } catch (error) {
      console.error('Error navigating to notifications:', error);
    }
  }

  // Navigate to profile
  navigateToProfile() {
    if (!this.navigationRef) return;
    
    try {
      this.navigationRef.navigate('Profile');
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  }

  // Get current route name
  getCurrentRouteName(): string | undefined {
    if (!this.navigationRef) return undefined;
    
    try {
      return this.navigationRef.getCurrentRoute()?.name;
    } catch (error) {
      console.error('Error getting current route name:', error);
      return undefined;
    }
  }

  // Check if app can handle URL
  static async canHandleURL(url: string): Promise<boolean> {
    try {
      // Check if it's our app scheme or domain
      return url.startsWith('blogapp://') || url.includes('yourblog.com');
    } catch (error) {
      console.error('Error checking if app can handle URL:', error);
      return false;
    }
  }
}

export const deepLinkService = new DeepLinkService();
export default deepLinkService;