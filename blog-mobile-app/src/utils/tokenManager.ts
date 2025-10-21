import {authService} from '@/services/auth';

class TokenManager {
  private renewalTimer: NodeJS.Timeout | null = null;
  private isRenewing = false;

  async startAutoRenewal(): Promise<void> {
    try {
      const accessToken = await authService.getStoredAccessToken();
      if (!accessToken) {
        return;
      }

      await this.scheduleNextRenewal(accessToken);
    } catch (error) {
      console.error('Failed to start auto renewal:', error);
    }
  }

  stopAutoRenewal(): void {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
      this.renewalTimer = null;
    }
    this.isRenewing = false;
  }

  private async scheduleNextRenewal(token: string): Promise<void> {
    try {
      const payload = this.decodeTokenPayload(token);
      if (!payload?.exp) {
        return;
      }

      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Refresh token 5 minutes before expiry, but not less than 1 minute
      const refreshTime = Math.max(60000, timeUntilExpiry - 5 * 60 * 1000);

      // Clear existing timer
      if (this.renewalTimer) {
        clearTimeout(this.renewalTimer);
      }

      this.renewalTimer = setTimeout(async () => {
        await this.performRenewal();
      }, refreshTime);

      console.log(`Token renewal scheduled in ${Math.round(refreshTime / 1000)} seconds`);
    } catch (error) {
      console.error('Failed to schedule token renewal:', error);
    }
  }

  private async performRenewal(): Promise<void> {
    if (this.isRenewing) {
      return;
    }

    this.isRenewing = true;

    try {
      const newTokens = await authService.refreshToken();
      console.log('Token renewed successfully');
      
      // Schedule next renewal with the new token
      await this.scheduleNextRenewal(newTokens.accessToken);
    } catch (error) {
      console.error('Token renewal failed:', error);
      // Stop auto renewal on failure
      this.stopAutoRenewal();
    } finally {
      this.isRenewing = false;
    }
  }

  private decodeTokenPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token payload:', error);
      return null;
    }
  }

  async getTokenExpiryTime(): Promise<number | null> {
    try {
      const accessToken = await authService.getStoredAccessToken();
      if (!accessToken) {
        return null;
      }

      const payload = this.decodeTokenPayload(accessToken);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch (error) {
      console.error('Failed to get token expiry time:', error);
      return null;
    }
  }

  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTime = await this.getTokenExpiryTime();
      if (!expiryTime) {
        return true;
      }

      return Date.now() >= expiryTime;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }

  async isTokenExpiringSoon(thresholdMinutes: number = 5): Promise<boolean> {
    try {
      const expiryTime = await this.getTokenExpiryTime();
      if (!expiryTime) {
        return true;
      }

      const thresholdTime = Date.now() + (thresholdMinutes * 60 * 1000);
      return thresholdTime >= expiryTime;
    } catch (error) {
      console.error('Failed to check token expiry threshold:', error);
      return true;
    }
  }
}

export const tokenManager = new TokenManager();