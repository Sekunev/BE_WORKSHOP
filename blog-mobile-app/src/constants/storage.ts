// Storage constants
export const STORAGE_KEYS = {
  // Auth related
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  BIOMETRIC_CREDENTIALS: 'biometric_credentials',
  USER_PREFERENCES: 'user_preferences',
  
  // App settings
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  NOTIFICATION_SETTINGS: 'notification_settings',
  
  // Cache keys
  BLOG_CACHE: 'blog_cache',
  CATEGORIES_CACHE: 'categories_cache',
  TAGS_CACHE: 'tags_cache',
  
  // Draft data
  DRAFT_BLOGS: 'draft_blogs',
  OFFLINE_ACTIONS: 'offline_actions',
  
  // Notification related
  FCM_TOKEN: 'fcm_token',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  
  // Social features
  SOCIAL_INTERACTIONS: 'social_interactions',
  ACTIVITY_FEED: 'activity_feed',
  
  // Analytics
  ANALYTICS_EVENTS: 'analytics_events',
  USER_ANALYTICS: 'user_analytics',
  
  // Error handling and logging
  ERROR_LOGS: 'error_logs',
  DEBUG_LOGS: 'debug_logs',
  PERFORMANCE_METRICS: 'performance_metrics',
};

export const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const CACHE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_ENTRIES: 1000,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
};