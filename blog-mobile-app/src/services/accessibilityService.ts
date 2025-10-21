import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredFontScale: number;
  announceForAccessibility: boolean;
}

class AccessibilityService {
  private settings: AccessibilitySettings = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    preferredFontScale: 1,
    announceForAccessibility: true,
  };

  private listeners: Array<(settings: AccessibilitySettings) => void> = [];

  async initialize(): Promise<void> {
    try {
      // Load saved settings
      await this.loadSettings();
      
      // Check system accessibility settings
      await this.checkSystemSettings();
      
      // Set up listeners for accessibility changes
      this.setupListeners();
    } catch (error) {
      console.error('Failed to initialize accessibility service:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('accessibility_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  }

  private async checkSystemSettings(): Promise<void> {
    try {
      // Check if screen reader is enabled
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.settings.isScreenReaderEnabled = isScreenReaderEnabled;

      // Check if reduce motion is enabled (iOS only)
      if (Platform.OS === 'ios') {
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        this.settings.isReduceMotionEnabled = isReduceMotionEnabled;
      }

      // Check if high contrast is enabled (iOS only)
      if (Platform.OS === 'ios') {
        const isHighContrastEnabled = await AccessibilityInfo.isHighContrastEnabled();
        this.settings.isHighContrastEnabled = isHighContrastEnabled;
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to check system accessibility settings:', error);
    }
  }

  private setupListeners(): void {
    // Listen for screen reader changes
    AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
      this.settings.isScreenReaderEnabled = isEnabled;
      this.notifyListeners();
    });

    // Listen for reduce motion changes (iOS only)
    if (Platform.OS === 'ios') {
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
        this.settings.isReduceMotionEnabled = isEnabled;
        this.notifyListeners();
      });

      AccessibilityInfo.addEventListener('highContrastChanged', (isEnabled) => {
        this.settings.isHighContrastEnabled = isEnabled;
        this.notifyListeners();
      });
    }
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  async updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings();
    this.notifyListeners();
  }

  subscribe(callback: (settings: AccessibilitySettings) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.settings));
  }

  // Announce text for screen readers
  announceForAccessibility(text: string): void {
    if (this.settings.announceForAccessibility && this.settings.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(text);
    }
  }

  // Set focus to a specific element
  setAccessibilityFocus(reactTag: number): void {
    if (this.settings.isScreenReaderEnabled) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }

  // Check if animations should be reduced
  shouldReduceMotion(): boolean {
    return this.settings.isReduceMotionEnabled;
  }

  // Check if high contrast mode is enabled
  isHighContrastMode(): boolean {
    return this.settings.isHighContrastEnabled;
  }

  // Get font scale factor
  getFontScale(): number {
    return this.settings.preferredFontScale;
  }

  // Check if screen reader is enabled
  isScreenReaderEnabled(): boolean {
    return this.settings.isScreenReaderEnabled;
  }
}

export const accessibilityService = new AccessibilityService();