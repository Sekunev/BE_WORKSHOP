import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {BlogStackParamList} from './types';
import {BlogListScreen, BlogDetailScreen} from '@/screens/blog';

const Stack = createStackNavigator<BlogStackParamList>();

const BlogNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="BlogList" 
        component={BlogListScreen}
      />
      <Stack.Screen 
        name="BlogDetail" 
        component={BlogDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default BlogNavigator;