# UI Kit Components

This directory contains reusable UI components that follow the design system and support theming.

## Components

### CustomButton
A flexible button component with multiple variants and sizes.

```tsx
import { CustomButton } from '@/components/ui';

<CustomButton
  title="Click me"
  onPress={() => console.log('Pressed')}
  variant="primary" // 'primary' | 'secondary' | 'outline'
  size="medium" // 'small' | 'medium' | 'large'
  loading={false}
  disabled={false}
/>
```

### CustomInput
A text input component with validation and error states.

```tsx
import { CustomInput } from '@/components/ui';

<CustomInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
  error={emailError}
  secureTextEntry={false}
  showPasswordToggle={false}
/>
```

### Toast
A toast notification component for showing temporary messages.

```tsx
import { useToast } from '@/contexts/ToastContext';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Usage
showSuccess('Operation completed successfully!');
showError('Something went wrong');
showWarning('Please check your input');
showInfo('Here is some information');
```

### Alert
A modal alert component for confirmations and important messages.

```tsx
import { Alert } from '@/components/ui';

<Alert
  visible={showAlert}
  title="Confirmation"
  message="Are you sure?"
  type="warning"
  buttons={[
    { text: 'Cancel', onPress: () => setShowAlert(false), style: 'cancel' },
    { text: 'Confirm', onPress: handleConfirm, style: 'default' }
  ]}
  onDismiss={() => setShowAlert(false)}
/>
```

### Skeleton Components
Loading skeleton components for better UX during data loading.

```tsx
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '@/components/ui';

// Basic skeleton
<Skeleton width="100%" height={20} />

// Text skeleton
<SkeletonText lines={3} lastLineWidth="60%" />

// Avatar skeleton
<SkeletonAvatar size={40} />

// Card skeleton
<SkeletonCard />
```

## Theme System

All components use the theme system for consistent styling and dark/light mode support.

### Using Theme in Components

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background.primary }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Current theme: {isDark ? 'Dark' : 'Light'}
      </Text>
    </View>
  );
};
```

### Common Styles

Use the common styles utility for consistent spacing and layout:

```tsx
import { useCommonStyles } from '@/constants/commonStyles';
import { useTheme } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  const commonStyles = useCommonStyles(theme);
  
  return (
    <View style={[commonStyles.container, commonStyles.paddingMd]}>
      <Text style={commonStyles.heading1}>Title</Text>
      <Text style={commonStyles.body}>Body text</Text>
    </View>
  );
};
```

## Responsive Design

Use responsive utilities for different screen sizes:

```tsx
import { wp, hp, isTablet, getResponsiveFontSize } from '@/utils/responsive';

const styles = StyleSheet.create({
  container: {
    width: wp(90), // 90% of screen width
    height: hp(50), // 50% of screen height
    padding: isTablet() ? 24 : 16,
  },
  text: {
    fontSize: getResponsiveFontSize(16),
  },
});
```

## Setup

To use the UI Kit in your app, wrap your app with the necessary providers:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        {/* Your app content */}
      </ToastProvider>
    </ThemeProvider>
  );
}
```

## Customization

### Extending the Theme

You can extend the theme by modifying the theme files in `@/constants/themes.ts`:

```tsx
export const customTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#your-custom-color',
  },
};
```

### Creating Custom Components

Follow the same pattern when creating new components:

```tsx
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const MyCustomComponent = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Component implementation
};

const createStyles = (theme: any) => StyleSheet.create({
  // Styles using theme values
});
```

## Best Practices

1. **Always use the theme system** - Don't hardcode colors or spacing
2. **Use common styles** - Leverage the common styles for consistency
3. **Make components responsive** - Use responsive utilities for different screen sizes
4. **Follow the component patterns** - Use the same structure as existing components
5. **Test on both themes** - Ensure components work in both light and dark modes
6. **Use TypeScript** - Leverage type safety for better development experience