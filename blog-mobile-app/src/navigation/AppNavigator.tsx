import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';

// Auth Screens
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';

// Main App Screens
import HomeScreen from '@/screens/blog/HomeScreen';
import BlogListScreen from '@/screens/blog/BlogListScreen';
import BlogDetailScreen from '@/screens/blog/BlogDetailScreen';
import CreateBlogScreen from '@/screens/blog/CreateBlogScreen';
import EditBlogScreen from '@/screens/blog/EditBlogScreen';
import MyBlogsScreen from '@/screens/blog/MyBlogsScreen';
import DashboardScreen from '@/screens/profile/DashboardScreen';
import ProfileSettingsScreen from '@/screens/profile/ProfileSettingsScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: true, title: 'Dashboard' }}
          />
          <Stack.Screen
            name="BlogList"
            component={BlogListScreen}
            options={{ headerShown: true, title: 'Blog Yazıları' }}
          />
          <Stack.Screen
            name="BlogDetail"
            component={BlogDetailScreen}
            options={{ headerShown: true, title: 'Blog Detayı' }}
          />
          <Stack.Screen
            name="CreateBlog"
            component={CreateBlogScreen}
            options={{ headerShown: true, title: 'Yeni Blog Yaz' }}
          />
          <Stack.Screen
            name="MyBlogs"
            component={MyBlogsScreen}
            options={{ headerShown: true, title: 'Bloglarım' }}
          />
          <Stack.Screen
            name="EditBlog"
            component={EditBlogScreen}
            options={{ headerShown: true, title: 'Blog Düzenle' }}
          />
          <Stack.Screen
            name="ProfileSettings"
            component={ProfileSettingsScreen}
            options={{ headerShown: true, title: 'Profil Ayarları' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;