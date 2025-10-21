import { useState, useEffect, useCallback } from 'react';
import { offlineService, OfflineState, DraftBlog } from '@/services/offlineService';
import { networkService, NetworkState } from '@/services/network';
import { CreateBlogData } from '@/types/blog';

export interface UseOfflineReturn {
  // Network state
  isOffline: boolean;
  networkState: NetworkState;
  
  // Offline state
  offlineState: OfflineState;
  
  // Draft management
  drafts: DraftBlog[];
  saveDraft: (blogData: Partial<CreateBlogData>, draftId?: string) => string;
  getDraft: (draftId: string) => DraftBlog | null;
  deleteDraft: (draftId: string) => void;
  
  // Sync management
  syncStatus: {
    pendingActions: number;
    pendingDrafts: number;
    lastSyncTime: number;
    isOnline: boolean;
  };
  syncPendingData: () => Promise<void>;
  
  // Offline actions
  queueOfflineAction: (type: string, data: any) => string;
  
  // Utility functions
  isBlogAvailableOffline: (blogId: string) => boolean;
  preloadBlogsForOffline: (blogIds: string[]) => Promise<void>;
  clearOfflineData: () => void;
}

export const useOffline = (): UseOfflineReturn => {
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkService.getCurrentState()
  );
  const [offlineState, setOfflineState] = useState<OfflineState>(
    offlineService.getState()
  );

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribeNetwork = networkService.addListener(setNetworkState);
    
    // Subscribe to offline state changes
    const unsubscribeOffline = offlineService.addListener(setOfflineState);

    return () => {
      unsubscribeNetwork();
      unsubscribeOffline();
    };
  }, []);

  const saveDraft = useCallback((blogData: Partial<CreateBlogData>, draftId?: string): string => {
    return offlineService.saveDraft(blogData, draftId);
  }, []);

  const getDraft = useCallback((draftId: string): DraftBlog | null => {
    return offlineService.getDraft(draftId);
  }, []);

  const deleteDraft = useCallback((draftId: string): void => {
    offlineService.deleteDraft(draftId);
  }, []);

  const syncPendingData = useCallback(async (): Promise<void> => {
    await offlineService.syncPendingData();
  }, []);

  const queueOfflineAction = useCallback((type: string, data: any): string => {
    return offlineService.queueAction(type as any, data);
  }, []);

  const isBlogAvailableOffline = useCallback((blogId: string): boolean => {
    return offlineService.isBlogAvailableOffline(blogId);
  }, []);

  const preloadBlogsForOffline = useCallback(async (blogIds: string[]): Promise<void> => {
    await offlineService.preloadBlogsForOffline(blogIds);
  }, []);

  const clearOfflineData = useCallback((): void => {
    offlineService.clearOfflineData();
  }, []);

  return {
    isOffline: !networkState.isConnected || !networkState.isInternetReachable,
    networkState,
    offlineState,
    drafts: offlineState.drafts,
    saveDraft,
    getDraft,
    deleteDraft,
    syncStatus: offlineService.getSyncStatus(),
    syncPendingData,
    queueOfflineAction,
    isBlogAvailableOffline,
    preloadBlogsForOffline,
    clearOfflineData,
  };
};