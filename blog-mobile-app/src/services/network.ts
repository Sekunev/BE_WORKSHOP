import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { FastStorage } from './storage';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

class NetworkService {
  private listeners: ((state: NetworkState) => void)[] = [];
  private currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Subscribe to network state changes
    NetInfo.addEventListener((state: NetInfoState) => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };

      this.currentState = networkState;
      this.notifyListeners(networkState);

      // Store network state for offline handling
      FastStorage.setObject('network_state', networkState);
    });
  }

  getCurrentState(): NetworkState {
    return this.currentState;
  }

  async getNetworkState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };
  }

  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  isOffline(): boolean {
    return !this.isOnline();
  }

  addListener(callback: (state: NetworkState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(state: NetworkState) {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  // Queue offline actions
  queueOfflineAction(action: any) {
    try {
      const offlineActions = FastStorage.getObject<any[]>('offline_actions') || [];
      offlineActions.push({
        ...action,
        timestamp: Date.now(),
      });
      FastStorage.setObject('offline_actions', offlineActions);
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }

  // Process queued actions when back online
  async processOfflineActions() {
    try {
      const offlineActions = FastStorage.getObject<any[]>('offline_actions') || [];

      if (offlineActions.length === 0) {
        return;
      }

      console.log(`Processing ${offlineActions.length} offline actions`);

      // Process actions one by one
      for (const action of offlineActions) {
        try {
          await this.processOfflineAction(action);
        } catch (error) {
          console.error('Failed to process offline action:', error);
          // Continue with other actions
        }
      }

      // Clear processed actions
      FastStorage.removeItem('offline_actions');
    } catch (error) {
      console.error('Failed to process offline actions:', error);
    }
  }

  private async processOfflineAction(action: any) {
    // This would be implemented based on the action type
    // For now, just log the action
    console.log('Processing offline action:', action);
  }
}

export const networkService = new NetworkService();