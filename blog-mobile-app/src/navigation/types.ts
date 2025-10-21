import {NavigatorScreenParams} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

// Root Stack Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Splash: undefined;
};

// Auth Stack Navigator Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  BlogList: NavigatorScreenParams<BlogStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Blog Stack Navigator Types (nested in Main Tab)
export type BlogStackParamList = {
  BlogList: undefined;
  BlogDetail: {slug: string};
  CreateBlog: undefined;
  EditBlog: {blogId: string};
};

// Profile Stack Navigator Types (nested in Main Tab)
export type ProfileStackParamList = {
  Dashboard: undefined;
  MyBlogs: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
  NotificationHistory: undefined;
  ActivityFeed: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

export type BlogStackScreenProps<T extends keyof BlogStackParamList> = 
  StackScreenProps<BlogStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  StackScreenProps<ProfileStackParamList, T>;

// Navigation Props for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}