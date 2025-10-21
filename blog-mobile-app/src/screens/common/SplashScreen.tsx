import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {COLORS, TYPOGRAPHY, SPACING} from '@/constants/theme';

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog Mobile App</Text>
      <LoadingSpinner text="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
});

export default SplashScreen;