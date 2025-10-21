import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useAuthContext} from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import {COLORS} from '@/constants/theme';

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
}) => {
  const {isLoading, isAuthenticated} = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" text="Yükleniyor..." />
      </View>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthGuard;