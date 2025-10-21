import { FastStorage } from './storage';
import { networkService } from './network';
import { cacheManager } from './cacheManager';
import { Blog, CreateBlogData, UpdateBlogData } from '@/types/blog';
import { STORAGE_KEYS } from '@/constants/storage';

export interface OfflineAction {
  id: string;
  type: 'CREATE_BLOG' | 'UPDATE_BLOG' | 'DELETE_BLOG' | 'LIKE_BLOG';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface DraftBlog extends CreateBlogData {
  id: string;
  lastModified: number;
  isOfflineDraft: boolean;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface OfflineState {
  isOffline: boolean;
  pendingActions: OfflineAction[];
  drafts: DraftBlog[];
  lastSyncTime: number;
}

class OfflineService {
  private state: OfflineState;
  private listeners: ((state: OfflineState) => void)[] = [];

  constructor() {
    this.state = {
      isOffline: false,
      pendingActions: [],
      drafts: [],
      lastSyncTime: 0,
    };

    this.initialize();
  }

  private initialize() {
    // Load offline state from storage
    this.loadOfflineState();

    // Listen to network changes
    networkService.addListener((networkState) => {
      const wasOffline = this.state.isOffline;
      this.state.isOffline = !networkState.isConnected || !networkState.isInternetReachable;

      // If we just came back online, sync pending data
      if (wasOffline && !this.state.isOffline) {
        this.syncPendingData();
      }

      this.notifyListeners();
    });

    // Initial network state check
    const currentNetworkState = networkService.getCurrentState();
    this.state.isOffline = !currentNetworkState.isConnected || !currentNetworkState.isInternetReachable;
  }

  private loadOfflineState() {
    try {
      const savedActions = FastStorage.getObject<OfflineAction[]>(STORAGE_KEYS.OFFLINE_ACTIONS) || [];
      const savedDrafts = FastStorage.getObject<DraftBlog[]>(STORAGE_KEYS.DRAFT_BLOGS) || [];
      const lastSyncTime = FastStorage.getObject<number>('last_sync_time') || 0;

      this.state.pendingActions = savedActions;
      this.state.drafts = savedDrafts;
      this.state.lastSyncTime = lastSyncTime;
    } catch (error) {
      console.error('Failed to load offline state:', error);
    }
  }

  private saveOfflineState() {
    try {
      FastStorage.setObject(STORAGE_KEYS.OFFLINE_ACTIONS, this.state.pendingActions);
      FastStorage.setObject(STORAGE_KEYS.DRAFT_BLOGS, this.state.drafts);
      FastStorage.setObject('last_sync_time', this.state.lastSyncTime);
    } catch (error) {
      console.error('Failed to save offline state:', error);
    }
  }

  // Get current offline state
  getState(): OfflineState {
    return { ...this.state };
  }

  // Check if currently offline
  isOffline(): boolean {
    return this.state.isOffline;
  }

  // Add listener for state changes
  addListener(callback: (state: OfflineState) => void): () => void {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Offline service listener error:', error);
      }
    });
  }

  // Save draft blog
  saveDraft(blogData: Partial<CreateBlogData>, draftId?: string): string {
    try {
      const id = draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const draft: DraftBlog = {
        id,
        title: blogData.title || '',
        content: blogData.content || '',
        excerpt: blogData.excerpt,
        category: blogData.category || '',
        tags: blogData.tags || [],
        featuredImage: blogData.featuredImage,
        isPublished: false,
        lastModified: Date.now(),
        isOfflineDraft: this.state.isOffline,
        syncStatus: this.state.isOffline ? 'pending' : 'synced',
      };

      // Update or add draft
      const existingIndex = this.state.drafts.findIndex(d => d.id === id);
      if (existingIndex >= 0) {
        this.state.drafts[existingIndex] = draft;
      } else {
        this.state.drafts.push(draft);
      }

      this.saveOfflineState();
      this.notifyListeners();

      console.log(`Draft saved: ${draft.title} (${draft.isOfflineDraft ? 'offline' : 'online'})`);
      return id;
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }

  // Get all drafts
  getDrafts(): DraftBlog[] {
    return [...this.state.drafts];
  }

  // Get specific draft
  getDraft(draftId: string): DraftBlog | null {
    return this.state.drafts.find(d => d.id === draftId) || null;
  }

  // Delete draft
  deleteDraft(draftId: string): void {
    try {
      this.state.drafts = this.state.drafts.filter(d => d.id !== draftId);
      this.saveOfflineState();
      this.notifyListeners();
      
      console.log(`Draft deleted: ${draftId}`);
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  }

  // Queue offline action
  queueAction(type: OfflineAction['type'], data: any): string {
    try {
      const action: OfflineAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
      };

      this.state.pendingActions.push(action);
      this.saveOfflineState();
      this.notifyListeners();

      console.log(`Queued offline action: ${type}`);
      return action.id;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      throw error;
    }
  }

  // Sync pending data when back online
  async syncPendingData(): Promise<void> {
    if (this.state.isOffline) {
      console.log('Still offline, skipping sync');
      return;
    }

    try {
      console.log('Starting offline data sync...');

      // Sync drafts first
      await this.syncDrafts();

      // Then sync pending actions
      await this.syncPendingActions();

      this.state.lastSyncTime = Date.now();
      this.saveOfflineState();
      this.notifyListeners();

      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private async syncDrafts(): Promise<void> {
    const pendingDrafts = this.state.drafts.filter(d => d.syncStatus === 'pending');
    
    if (pendingDrafts.length === 0) {
      return;
    }

    console.log(`Syncing ${pendingDrafts.length} pending drafts...`);

    for (const draft of pendingDrafts) {
      try {
        draft.syncStatus = 'syncing';
        this.notifyListeners();

        // Here you would call your API to save the draft
        // For now, just simulate the sync
        await this.simulateApiCall();

        draft.syncStatus = 'synced';
        draft.isOfflineDraft = false;
        
        console.log(`Draft synced: ${draft.title}`);
      } catch (error) {
        console.error(`Failed to sync draft ${draft.id}:`, error);
        draft.syncStatus = 'failed';
      }
    }

    this.saveOfflineState();
    this.notifyListeners();
  }

  private async syncPendingActions(): Promise<void> {
    if (this.state.pendingActions.length === 0) {
      return;
    }

    console.log(`Syncing ${this.state.pendingActions.length} pending actions...`);

    const actionsToProcess = [...this.state.pendingActions];
    
    for (const action of actionsToProcess) {
      try {
        await this.processAction(action);
        
        // Remove successful action
        this.state.pendingActions = this.state.pendingActions.filter(a => a.id !== action.id);
        
        console.log(`Action processed: ${action.type}`);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        
        // Increment retry count
        action.retryCount++;
        
        if (action.retryCount >= action.maxRetries) {
          // Remove failed action after max retries
          this.state.pendingActions = this.state.pendingActions.filter(a => a.id !== action.id);
          console.log(`Action failed after ${action.maxRetries} retries: ${action.type}`);
        }
      }
    }

    this.saveOfflineState();
    this.notifyListeners();
  }

  private async processAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_BLOG':
        await this.processCreateBlog(action.data);
        break;
      case 'UPDATE_BLOG':
        await this.processUpdateBlog(action.data);
        break;
      case 'DELETE_BLOG':
        await this.processDeleteBlog(action.data);
        break;
      case 'LIKE_BLOG':
        await this.processLikeBlog(action.data);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async processCreateBlog(data: CreateBlogData): Promise<void> {
    // Here you would call your API to create the blog
    // For now, just simulate the API call
    await this.simulateApiCall();
    console.log('Blog created:', data.title);
  }

  private async processUpdateBlog(data: UpdateBlogData): Promise<void> {
    // Here you would call your API to update the blog
    await this.simulateApiCall();
    console.log('Blog updated:', data.id);
  }

  private async processDeleteBlog(data: { id: string }): Promise<void> {
    // Here you would call your API to delete the blog
    await this.simulateApiCall();
    console.log('Blog deleted:', data.id);
  }

  private async processLikeBlog(data: { id: string }): Promise<void> {
    // Here you would call your API to like the blog
    await this.simulateApiCall();
    console.log('Blog liked:', data.id);
  }

  private async simulateApiCall(): Promise<void> {
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Get offline blogs (cached blogs)
  getOfflineBlogs(): Blog[] {
    try {
      // This would get blogs from cache
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get offline blogs:', error);
      return [];
    }
  }

  // Check if blog is available offline
  isBlogAvailableOffline(blogId: string): boolean {
    return cacheManager.isAvailableOffline(blogId);
  }

  // Preload blogs for offline reading
  async preloadBlogsForOffline(blogIds: string[]): Promise<void> {
    try {
      await cacheManager.preloadContent(blogIds);
      console.log(`Preloaded ${blogIds.length} blogs for offline reading`);
    } catch (error) {
      console.error('Failed to preload blogs:', error);
    }
  }

  // Clear all offline data
  clearOfflineData(): void {
    try {
      this.state.pendingActions = [];
      this.state.drafts = [];
      this.state.lastSyncTime = 0;
      
      this.saveOfflineState();
      cacheManager.invalidateCache();
      
      this.notifyListeners();
      
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  // Get sync status
  getSyncStatus(): {
    pendingActions: number;
    pendingDrafts: number;
    lastSyncTime: number;
    isOnline: boolean;
  } {
    return {
      pendingActions: this.state.pendingActions.length,
      pendingDrafts: this.state.drafts.filter(d => d.syncStatus === 'pending').length,
      lastSyncTime: this.state.lastSyncTime,
      isOnline: !this.state.isOffline,
    };
  }
}

// Export singleton instance
export const offlineService = new OfflineService();