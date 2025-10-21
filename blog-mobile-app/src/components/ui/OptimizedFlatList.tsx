import React, { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { ListOptimization, MemoryManagement } from '../../utils/performance';
import { buildAccessibilityProps } from '../../utils/accessibility';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  itemHeight?: number;
  estimatedItemSize?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  enableVirtualization?: boolean;
  enableMemoryOptimization?: boolean;
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  itemHeight,
  estimatedItemSize,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  loading = false,
  error,
  emptyMessage = 'Gösterilecek öğe bulunamadı',
  emptyComponent,
  loadingComponent,
  errorComponent,
  accessibilityLabel,
  accessibilityHint,
  testID,
  enableVirtualization = true,
  enableMemoryOptimization = true,
  ...flatListProps
}: OptimizedFlatListProps<T>) {
  const { theme } = useTheme();
  const { settings } = useAccessibility();
  const flatListRef = useRef<FlatList<T>>(null);

  // Memoized optimal FlatList props for performance
  const optimizedProps = useMemo(() => {
    const baseProps = ListOptimization.getOptimalFlatListProps(itemHeight);
    
    // Adjust for accessibility settings
    if (settings.isScreenReaderEnabled) {
      // Reduce batch size for better screen reader experience
      baseProps.maxToRenderPerBatch = 5;
      baseProps.initialNumToRender = 3;
    }
    
    if (settings.isReduceMotionEnabled) {
      // Disable scroll animations for reduce motion
      baseProps.updateCellsBatchingPeriod = 0;
    }

    return baseProps;
  }, [itemHeight, settings.isScreenReaderEnabled, settings.isReduceMotionEnabled]);

  // Memoized render item with memory optimization
  const memoizedRenderItem = useCallback(
    (info: { item: T; index: number }) => {
      const element = renderItem(info);
      
      // Add accessibility props for list items
      return React.cloneElement(element, {
        ...element.props,
        ...buildAccessibilityProps({
          role: 'LIST_ITEM',
          label: element.props.accessibilityLabel || `${info.index + 1}. öğe`,
        }),
      });
    },
    [renderItem]
  );

  // Debounced end reached handler for performance
  const debouncedOnEndReached = useMemo(
    () => onEndReached ? MemoryManagement.debounce(onEndReached, 300) : undefined,
    [onEndReached]
  );

  // Key extractor with fallback
  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (flatListProps.keyExtractor) {
        return flatListProps.keyExtractor(item, index);
      }
      
      // Try to extract ID from common properties
      const itemAsAny = item as any;
      if (itemAsAny.id) return String(itemAsAny.id);
      if (itemAsAny._id) return String(itemAsAny._id);
      if (itemAsAny.key) return String(itemAsAny.key);
      
      return String(index);
    },
    [flatListProps.keyExtractor]
  );

  // Render empty component
  const renderEmptyComponent = useCallback(() => {
    if (loading && loadingComponent) {
      return loadingComponent;
    }
    
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            {...buildAccessibilityProps({
              label: 'İçerik yükleniyor',
              liveRegion: 'polite',
            })}
          />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            Yükleniyor...
          </Text>
        </View>
      );
    }

    if (error && errorComponent) {
      return errorComponent;
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text 
            style={[styles.errorText, { color: theme.colors.error }]}
            {...buildAccessibilityProps({
              role: 'ALERT',
              label: `Hata: ${error}`,
            })}
          >
            ⚠️ {error}
          </Text>
        </View>
      );
    }

    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.centerContainer}>
        <Text 
          style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          {...buildAccessibilityProps({
            role: 'TEXT',
            label: emptyMessage,
          })}
        >
          📝 {emptyMessage}
        </Text>
      </View>
    );
  }, [
    loading,
    error,
    emptyMessage,
    loadingComponent,
    errorComponent,
    emptyComponent,
    theme.colors,
  ]);

  // Render footer component for loading more
  const renderFooterComponent = useCallback(() => {
    if (!loading || data.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          {...buildAccessibilityProps({
            label: 'Daha fazla içerik yükleniyor',
            liveRegion: 'polite',
          })}
        />
      </View>
    );
  }, [loading, data.length, theme.colors.primary]);

  // Refresh control with accessibility
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
        {...buildAccessibilityProps({
          label: 'Yenilemek için aşağı çekin',
          hint: 'İçeriği yenilemek için aşağı çekin ve bırakın',
        })}
      />
    );
  }, [onRefresh, refreshing, theme.colors.primary]);

  // Memory cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (enableMemoryOptimization) {
        MemoryManagement.cleanup();
      }
    };
  }, [enableMemoryOptimization]);

  // List accessibility props
  const listAccessibilityProps = buildAccessibilityProps({
    role: 'LIST',
    label: accessibilityLabel || `Liste, ${data.length} öğe`,
    hint: accessibilityHint || 'Kaydırarak daha fazla öğe görün',
  });

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      onEndReached={debouncedOnEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooterComponent}
      testID={testID}
      {...listAccessibilityProps}
      {...optimizedProps}
      {...flatListProps}
      // Override with performance optimizations
      removeClippedSubviews={enableVirtualization && optimizedProps.removeClippedSubviews}
      maxToRenderPerBatch={optimizedProps.maxToRenderPerBatch}
      windowSize={optimizedProps.windowSize}
      initialNumToRender={optimizedProps.initialNumToRender}
      updateCellsBatchingPeriod={optimizedProps.updateCellsBatchingPeriod}
      getItemLayout={optimizedProps.getItemLayout}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});