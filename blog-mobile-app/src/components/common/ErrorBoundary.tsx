import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { lightTheme } from '../../constants/themes';
import { errorHandlingService } from '../../services/errorHandlingService';
import { debugLoggingService } from '../../services/debugLoggingService';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null, errorId: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true, 
      error,
      errorId: Date.now().toString()
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      // Log to our error handling service
      await errorHandlingService.logError(
        error,
        {
          additionalInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          }
        },
        'critical',
        false // This is an unhandled error
      );

      // Log to debug service
      debugLoggingService.error('ErrorBoundary', 'Unhandled error caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });

      // Call custom error handler if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } catch (loggingError) {
      console.error('Error in ErrorBoundary logging:', loggingError);
    }
  }

  handleRetry = () => {
    debugLoggingService.info('ErrorBoundary', 'User initiated retry', {
      errorId: this.state.errorId,
      error: this.state.error?.message,
    });
    
    this.setState({hasError: false, error: null, errorId: null});
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Bir Şeyler Ters Gitti</Text>
            <Text style={styles.message}>
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Hata Detayları (Geliştirici Modu):</Text>
                <Text style={styles.errorDetails}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorId && (
                  <Text style={styles.errorId}>
                    Hata ID: {this.state.errorId}
                  </Text>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: lightTheme.typography.fontSize['2xl'],
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  message: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: lightTheme.typography.lineHeight.relaxed * lightTheme.typography.fontSize.base,
    marginBottom: lightTheme.spacing.lg,
  },
  debugContainer: {
    backgroundColor: lightTheme.colors.background.secondary,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.sm,
    marginBottom: lightTheme.spacing.lg,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.semibold,
    color: lightTheme.colors.text.primary,
    marginBottom: lightTheme.spacing.xs,
  },
  errorDetails: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.error,
    fontFamily: 'monospace',
    marginBottom: lightTheme.spacing.xs,
  },
  errorId: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    ...lightTheme.shadows.sm,
  },
  retryButtonText: {
    color: lightTheme.colors.text.inverse,
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: lightTheme.typography.fontWeight.semibold,
  },
});

export default ErrorBoundary;