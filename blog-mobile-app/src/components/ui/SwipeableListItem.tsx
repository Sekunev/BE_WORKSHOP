import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility, useGestureAccessibility } from '../../hooks/useAccessibility';
import { buildAccessibilityProps } from '../../utils/accessibility';

interface SwipeAction {
  text: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

interface SwipeableListItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_WIDTH = 80;

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { theme } = useTheme();
  const { shouldReduceMotion } = useAccessibility();
  const { createAccessibleGesture } = useGestureAccessibility();
  
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureRef = useRef<PanGestureHandler>(null);

  // Calculate maximum swipe distances
  const maxLeftSwipe = leftActions.length * ACTION_WIDTH;
  const maxRightSwipe = rightActions.length * ACTION_WIDTH;

  // Create accessibility gesture props
  const gestureProps = createAccessibleGesture({
    onPress,
    onLongPress,
    onSwipeLeft: rightActions.length > 0 ? rightActions[0].onPress : undefined,
    onSwipeRight: leftActions.length > 0 ? leftActions[0].onPress : undefined,
    accessibilityLabel,
    accessibilityHint,
  });

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: false,
      listener: (event: PanGestureHandlerGestureEvent) => {
        const { translationX } = event.nativeEvent;
        
        // Limit swipe distance
        const clampedTranslationX = Math.max(
          -maxRightSwipe,
          Math.min(maxLeftSwipe, translationX)
        );
        
        translateX.setValue(clampedTranslationX);
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    const { translationX, velocityX, state } = event.nativeEvent;
    
    if (state === 5) { // GESTURE_STATE_END
      const shouldOpenLeft = translationX > maxLeftSwipe / 2 || velocityX > 500;
      const shouldOpenRight = translationX < -maxRightSwipe / 2 || velocityX < -500;
      
      let toValue = 0;
      
      if (shouldOpenLeft && leftActions.length > 0) {
        toValue = maxLeftSwipe;
      } else if (shouldOpenRight && rightActions.length > 0) {
        toValue = -maxRightSwipe;
      }
      
      // Animate to final position
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, { [side]: 0 }]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              { 
                backgroundColor: action.backgroundColor,
                width: ACTION_WIDTH,
              }
            ]}
            onPress={() => {
              action.onPress();
              closeSwipe();
            }}
            {...buildAccessibilityProps({
              role: 'BUTTON',
              label: action.text,
              hint: `${action.text} eylemini gerçekleştir`,
            })}
          >
            {action.icon && (
              <View style={styles.actionIcon}>
                {action.icon}
              </View>
            )}
            <Text style={[styles.actionText, { color: action.color }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // If reduce motion is enabled, disable swipe gestures
  if (shouldReduceMotion) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.container}
        testID={testID}
        {...gestureProps}
      >
        <View style={styles.content}>
          {children}
        </View>
        
        {/* Show action buttons as overlay when reduce motion is enabled */}
        {(leftActions.length > 0 || rightActions.length > 0) && (
          <View style={styles.staticActionsContainer}>
            {leftActions.map((action, index) => (
              <TouchableOpacity
                key={`left-${index}`}
                style={[styles.staticActionButton, { backgroundColor: action.backgroundColor }]}
                onPress={action.onPress}
                {...buildAccessibilityProps({
                  role: 'BUTTON',
                  label: action.text,
                  hint: `${action.text} eylemini gerçekleştir`,
                })}
              >
                {action.icon || <Text style={{ color: action.color }}>{action.text}</Text>}
              </TouchableOpacity>
            ))}
            {rightActions.map((action, index) => (
              <TouchableOpacity
                key={`right-${index}`}
                style={[styles.staticActionButton, { backgroundColor: action.backgroundColor }]}
                onPress={action.onPress}
                {...buildAccessibilityProps({
                  role: 'BUTTON',
                  label: action.text,
                  hint: `${action.text} eylemini gerçekleştir`,
                })}
              >
                {action.icon || <Text style={{ color: action.color }}>{action.text}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right Actions */}
      {renderActions(rightActions, 'right')}
      
      {/* Main Content */}
      <PanGestureHandler
        ref={gestureRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.touchableContent}
            testID={testID}
            {...gestureProps}
          >
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'white',
    zIndex: 1,
  },
  touchableContent: {
    flex: 1,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 0,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionIcon: {
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  staticActionsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 2,
  },
  staticActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});