import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { lightTheme } from '../../constants/themes';
import { useMonitoring, useApiMonitoring, usePerformanceMonitoring } from '../../hooks/useMonitoring';
import { DebugPanel } from '../../components/common';
import { handleError, retryOperation, asyncErrorBoundary } from '../../utils/errorHandling';

const MonitoringExampleScreen: React.FC = () => {
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use monitoring hooks
  const {
    logError,
    trackEvent,
    recordPerformance,
    monitorApiRequest,
    trackUserAction,
    endScreenLoad,
  } = useMonitoring({
    screenName: 'MonitoringExample',
    trackScreenView: true,
    trackPerformance: true,
  });

  const { monitorRequest } = useApiMonitoring();
  const { startTiming, endTiming, measureAsync } = usePerformanceMonitoring();

  useEffect(() => {
    // Simulate screen load completion
    const timer = setTimeout(() => {
      endScreenLoad();
    }, 1000);

    return () => clearTimeout(timer);
  }, [endScreenLoad]);

  // Example: Handle error with monitoring
  const handleTestError = async () => {
    try {
      throw new Error('Bu bir test hatasıdır');
    } catch (error) {
      await handleError(error as Error, {
        showUserMessage: true,
        severity: 'low',
        context: {
          screen: 'MonitoringExample',
          action: 'test_error_button',
          additionalInfo: { testType: 'manual_error' },
        },
      });
    }
  };

  // Example: API request with monitoring
  const handleApiTest = async () => {
    setLoading(true);
    try {
      await monitorRequest('GET', '/api/test', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random error
        if (Math.random() > 0.7) {
          throw new Error('API test error');
        }
        
        return { success: true };
      });
      
      Alert.alert('Başarılı', 'API test başarıyla tamamlandı');
    } catch (error) {
      await handleError(error as Error, {
        showUserMessage: true,
        customMessage: 'API test sırasında bir hata oluştu',
        context: {
          screen: 'MonitoringExample',
          action: 'api_test',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Example: Performance measurement
  const handlePerformanceTest = async () => {
    startTiming('performance_test');
    
    try {
      // Simulate heavy operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const duration = endTiming('performance_test', 'custom', {
        testType: 'manual_performance_test',
      });
      
      Alert.alert('Performans Testi', `İşlem ${duration}ms sürdü`);
    } catch (error) {
      endTiming('performance_test', 'custom', { error: true });
      await logError(error as Error, {
        action: 'performance_test',
      });
    }
  };

  // Example: Retry operation
  const handleRetryTest = async () => {
    setLoading(true);
    try {
      const result = await retryOperation(
        async () => {
          // Simulate operation that fails sometimes
          if (Math.random() > 0.6) {
            throw new Error('Geçici hata oluştu');
          }
          return 'Başarılı!';
        },
        {
          maxAttempts: 3,
          delay: 1000,
          shouldRetry: (error) => error.message.includes('Geçici'),
          onRetry: (attempt, error) => {
            console.log(`Deneme ${attempt}: ${error.message}`);
          },
          context: {
            screen: 'MonitoringExample',
            action: 'retry_test',
          },
        }
      );
      
      Alert.alert('Başarılı', result);
    } catch (error) {
      Alert.alert('Hata', 'Tüm denemeler başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  // Example: Async error boundary
  const handleAsyncBoundaryTest = async () => {
    const result = await asyncErrorBoundary(
      async () => {
        // Simulate async operation that might fail
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (Math.random() > 0.5) {
          throw new Error('Async boundary test hatası');
        }
        
        return 'Async işlem başarılı';
      },
      {
        showUserMessage: true,
        customMessage: 'Async işlem sırasında bir hata oluştu',
        context: {
          screen: 'MonitoringExample',
          action: 'async_boundary_test',
        },
      }
    );
    
    if (result) {
      Alert.alert('Başarılı', result);
    }
  };

  // Example: Track user action
  const handleUserActionTest = async () => {
    await trackUserAction('button_clicked', {
      buttonName: 'user_action_test',
      timestamp: new Date().toISOString(),
    });
    
    Alert.alert('Kullanıcı Aksiyonu', 'Aksiyon başarıyla kaydedildi');
  };

  // Example: Measure async operation
  const handleMeasureAsyncTest = async () => {
    try {
      const result = await measureAsync(
        'async_operation_test',
        async () => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 2000));
          return 'Async ölçüm tamamlandı';
        },
        'custom',
        { testType: 'async_measurement' }
      );
      
      Alert.alert('Ölçüm Tamamlandı', result);
    } catch (error) {
      await logError(error as Error, {
        action: 'measure_async_test',
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Monitoring System Test</Text>
        <Text style={styles.subtitle}>
          Bu ekran monitoring sisteminin nasıl kullanılacağını gösterir
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hata Yönetimi</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleTestError}>
            <Text style={styles.buttonText}>Test Hatası Oluştur</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleRetryTest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Retry Mekanizması Test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleAsyncBoundaryTest}>
            <Text style={styles.buttonText}>Async Error Boundary Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Monitoring</Text>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleApiTest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>API Request Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performans Monitoring</Text>
          
          <TouchableOpacity style={styles.button} onPress={handlePerformanceTest}>
            <Text style={styles.buttonText}>Performans Ölçümü Test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleMeasureAsyncTest}>
            <Text style={styles.buttonText}>Async Ölçüm Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleUserActionTest}>
            <Text style={styles.buttonText}>Kullanıcı Aksiyonu Kaydet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Panel</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.debugButton]} 
            onPress={() => setDebugPanelVisible(true)}
          >
            <Text style={styles.buttonText}>Debug Panel Aç</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>İşlem devam ediyor...</Text>
          </View>
        )}
      </View>

      <DebugPanel
        visible={debugPanelVisible}
        onClose={() => setDebugPanelVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background.primary,
  },
  content: {
    padding: lightTheme.spacing.lg,
  },
  title: {
    fontSize: lightTheme.typography.fontSize['2xl'],
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.xl,
  },
  section: {
    marginBottom: lightTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.semibold,
    color: lightTheme.colors.text.primary,
    marginBottom: lightTheme.spacing.md,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
    borderRadius: lightTheme.borderRadius.md,
    marginBottom: lightTheme.spacing.sm,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: lightTheme.colors.text.secondary,
    opacity: 0.6,
  },
  debugButton: {
    backgroundColor: lightTheme.colors.secondary,
  },
  buttonText: {
    color: lightTheme.colors.text.inverse,
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: lightTheme.typography.fontWeight.semibold,
  },
  loadingContainer: {
    padding: lightTheme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text.secondary,
  },
});

export default MonitoringExampleScreen;