import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ProfileStackParamList} from './types';
import {
  DashboardScreen,
  MyBlogsScreen,
  EditProfileScreen,
  SettingsScreen,
  ChangePasswordScreen,
  NotificationPreferencesScreen,
  NotificationHistoryScreen,
  ActivityFeedScreen,
} from '@/screens/profile';
import {COLORS} from '@/constants/theme';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background.secondary,
        },
        headerTintColor: COLORS.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: COLORS.background.primary,
        },
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="MyBlogs"
        component={MyBlogsScreen}
        options={{
          title: 'My Blogs',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerShown: false, // Using custom header in component
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false, // Using custom header in component
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          headerShown: false, // Using custom header in component
        }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{
          title: 'Notification Preferences',
          headerShown: false, // Using custom header in component
        }}
      />
      <Stack.Screen
        name="NotificationHistory"
        component={NotificationHistoryScreen}
        options={{
          title: 'Notifications',
          headerShown: false, // Using custom header in component
        }}
      />
      <Stack.Screen
        name="ActivityFeed"
        component={ActivityFeedScreen}
        options={{
          title: 'Activity Feed',
          headerShown: false, // Using custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;