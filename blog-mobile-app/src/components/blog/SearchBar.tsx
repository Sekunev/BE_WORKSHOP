import React, {useState, useCallback} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search blogs...',
  style,
  autoFocus = false,
}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    onSearch(value);
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear();
  }, [onChangeText, onClear]);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused, style]}>
      {/* Search Icon */}
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={handleSubmit}
        activeOpacity={0.7}>
        <Icon
          name="search"
          size={20}
          color={isFocused ? theme.colors.primary.main : theme.colors.text.tertiary}
        />
      </TouchableOpacity>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}>
          <Icon
            name="close-circle"
            size={20}
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      paddingHorizontal: theme.spacing.md,
      height: 48,
    },
    containerFocused: {
      borderColor: theme.colors.primary.main,
      backgroundColor: theme.colors.surface.primary,
      ...theme.shadows.sm,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      paddingVertical: 0, // Remove default padding on Android
    },
    clearButton: {
      marginLeft: theme.spacing.sm,
    },
  });

export default SearchBar;