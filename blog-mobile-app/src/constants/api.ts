// API constants
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:5000/api' 
    : 'https://your-api.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // Blog endpoints
  BLOGS: '/blogs',
  BLOG_BY_SLUG: '/blogs/slug',
  MY_BLOGS: '/blogs/my',
  LIKE_BLOG: '/blogs/like',
  
  // User endpoints
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  UPLOAD_AVATAR: '/users/avatar',
  
  // Categories and tags
  CATEGORIES: '/categories',
  TAGS: '/tags',
};