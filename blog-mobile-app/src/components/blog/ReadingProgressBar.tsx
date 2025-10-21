import React from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';

import {useTheme} from '@/contexts/ThemeContext';

interface ReadingProgressBarProps {
  progress: number; // 0 to 1
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const ReadingProgressBar = ({progress}: ReadingProgressBarProps) => {
  const {theme} = useTheme();

  const progressWidth = React.useMemo(() => {
    return new Animated.Value(progress * SCREEN_WIDTH);
  }, [progress]);

  React.useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress * SCREEN_WIDTH,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface.secondary}]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: theme.colors.primary,
            width: progressWidth,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1001,
  },
  progressBar: {
    height: '100%',
  },
});

export default ReadingProgressBar;