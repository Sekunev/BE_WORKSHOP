import { FastStorage, CacheStorage } from './storage';
import { networkService } from './network';
import { Blog, BlogQueryParams } from '@/types/blog';
import { STORAGE_KEYS, CACHE_EXPIRY } from '@/constants/storage';

export interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  maxAge: number; // Maximum age in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number; // Size in bytes
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
}

class CacheManager {
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxAge: CACHE_EXPIRY.LONG, // 24 hours default
      cleanupInterval: 60 * 60 * 1000, // 1 hour cleanup interval
      ...config,
    };

    this.stats = {
      totalSize: 0,
      entryCount: 0,
      hitRate: 0,
      missRate: 0,
    };

    this.initialize();
  }

  private initialize() {
    // Load existing stats
    this.loadStats();
    
    // Start cleanup timer
    this.startCleanupTimer();
    
    // Listen to network changes for sync
    networkService.addListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncPendingData();
      }
    });
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private loadStats() {
    const savedStats = FastStorage.getObject<CacheStats>('cache_stats');
    if (savedStats) {
      this.stats = savedStats;
    }
  }

  private saveStats() {
    FastStorage.setObject('cache_stats', this.stats);
  }

  // Cache blog content
  cacheBlog(blog: Blog): void {
    try {
      const cacheKey = `blog_${blog.id}`;
      const entry: CacheEntry<Blog> = {
        data: blog,
        timestamp: Date.now(),
        size: this.calculateSize(blog),
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      // Check if we need to make space
      if (this.stats.totalSize + entry.size > this.config.maxSize) {
        this.evictLeastRecentlyUsed(entry.size);
      }

      CacheStorage.setItem(cacheKey, entry, this.config.maxAge);
      this.updateStats(entry.size, true);
      
      console.log(`Cached blog: ${blog.title} (${entry.size} bytes)`);
    } catch (error) {
      console.error('Failed to cache blog:', error);
    }
  }

  // Get cached blog
  getCachedBlog(blogId: string): Blog | null {
    try {
      const cacheKey = `blog_${blogId}`;
      const entry = CacheStorage.getItem<CacheEntry<Blog>>(cacheKey);

      if (entry) {
        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        CacheStorage.setItem(cacheKey, entry, this.config.maxAge);
        
        this.stats.hitRate++;
        this.saveStats();
        
        return entry.data;
      }

      this.stats.missRate++;
      this.saveStats();
      return null;
    } catch (error) {
      console.error('Failed to get cached blog:', error);
      return null;
    }
  }

  // Cache blog list
  cacheBlogList(params: BlogQueryParams, blogs: Blog[], pagination: any): void {
    try {
      const cacheKey = this.generateListCacheKey(params);
      const entry: CacheEntry<{blogs: Blog[], pagination: any}> = {
        data: { blogs, pagination },
        timestamp: Date.now(),
        size: this.calculateSize({ blogs, pagination }),
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      CacheStorage.setItem(cacheKey, entry, CACHE_EXPIRY.MEDIUM);
      this.updateStats(entry.size, true);
      
      console.log(`Cached blog list: ${blogs.length} blogs (${entry.size} bytes)`);
    } catch (error) {
      console.error('Failed to cache blog list:', error);
    }
  }

  // Get cached blog list
  getCachedBlogList(params: BlogQueryParams): {blogs: Blog[], pagination: any} | null {
    try {
      const cacheKey = this.generateListCacheKey(params);
      const entry = CacheStorage.getItem<CacheEntry<{blogs: Blog[], pagination: any}>>(cacheKey);

      if (entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        CacheStorage.setItem(cacheKey, entry, CACHE_EXPIRY.MEDIUM);
        
        this.stats.hitRate++;
        this.saveStats();
        
        return entry.data;
      }

      this.stats.missRate++;
      this.saveStats();
      return null;
    } catch (error) {
      console.error('Failed to get cached blog list:', error);
      return null;
    }
  }

  // Generate cache key for blog list queries
  private generateListCacheKey(params: BlogQueryParams): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key as keyof BlogQueryParams];
        return result;
      }, {} as any);
    
    return `blog_list_${JSON.stringify(sortedParams)}`;
  }

  // Calculate approximate size of data in bytes
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback calculation
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  // Evict least recently used items to make space
  private evictLeastRecentlyUsed(requiredSpace: number): void {
    try {
      // This is a simplified LRU implementation
      // In a production app, you might want a more sophisticated approach
      const freedSpace = requiredSpace * 1.5; // Free 50% more than needed
      let currentFreed = 0;

      // Get all cache keys and their access times
      const cacheEntries: Array<{key: string, lastAccessed: number, size: number}> = [];
      
      // Note: This is a simplified approach. In production, you'd want to
      // maintain a proper index of cache entries
      console.log(`Evicting LRU items to free ${freedSpace} bytes`);
      
      // For now, just clear some old entries
      this.cleanup();
      
    } catch (error) {
      console.error('Failed to evict LRU items:', error);
    }
  }

  // Update cache statistics
  private updateStats(size: number, isAdd: boolean): void {
    if (isAdd) {
      this.stats.totalSize += size;
      this.stats.entryCount++;
    } else {
      this.stats.totalSize -= size;
      this.stats.entryCount--;
    }
    this.saveStats();
  }

  // Cleanup expired and old entries
  cleanup(): void {
    try {
      console.log('Running cache cleanup...');
      
      // This is a simplified cleanup - in production you'd iterate through
      // all cache entries and remove expired ones
      const now = Date.now();
      const maxAge = this.config.maxAge;
      
      // Clear very old entries
      // Note: This is a basic implementation
      // You might want to implement a more sophisticated cleanup strategy
      
      console.log('Cache cleanup completed');
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  // Invalidate specific cache entries
  invalidateCache(pattern?: string): void {
    try {
      if (pattern) {
        // Invalidate entries matching pattern
        console.log(`Invalidating cache entries matching: ${pattern}`);
        // Implementation would depend on your cache key structure
      } else {
        // Clear all cache
        CacheStorage.clear();
        this.stats = {
          totalSize: 0,
          entryCount: 0,
          hitRate: 0,
          missRate: 0,
        };
        this.saveStats();
        console.log('All cache invalidated');
      }
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Sync pending data when network is available
  private async syncPendingData(): Promise<void> {
    try {
      console.log('Syncing pending data...');
      
      // Get pending drafts
      const pendingDrafts = FastStorage.getObject<any[]>(STORAGE_KEYS.DRAFT_BLOGS) || [];
      
      if (pendingDrafts.length > 0) {
        console.log(`Found ${pendingDrafts.length} pending drafts to sync`);
        // Process drafts - this would integrate with your API service
        // For now, just log them
        pendingDrafts.forEach(draft => {
          console.log('Pending draft:', draft.title);
        });
      }

      // Process offline actions
      await networkService.processOfflineActions();
      
      console.log('Data sync completed');
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  // Preload content for offline use
  async preloadContent(blogIds: string[]): Promise<void> {
    try {
      console.log(`Preloading ${blogIds.length} blogs for offline use`);
      
      // This would typically fetch from API and cache
      // For now, just mark as preloaded
      const preloadedIds = FastStorage.getObject<string[]>('preloaded_blogs') || [];
      const newPreloaded = [...new Set([...preloadedIds, ...blogIds])];
      
      FastStorage.setObject('preloaded_blogs', newPreloaded);
      
      console.log('Content preloading completed');
    } catch (error) {
      console.error('Failed to preload content:', error);
    }
  }

  // Check if content is available offline
  isAvailableOffline(blogId: string): boolean {
    const cachedBlog = this.getCachedBlog(blogId);
    return cachedBlog !== null;
  }

  // Destroy cache manager
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();