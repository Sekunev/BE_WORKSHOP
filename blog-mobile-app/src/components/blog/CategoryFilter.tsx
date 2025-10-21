import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  style?: ViewStyle;
  loading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  style,
  loading = false,
}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      onSelectCategory(null); // Deselect if already selected
    } else {
      onSelectCategory(category);
    }
  };

  const handleAllPress = () => {
    onSelectCategory(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Loading skeleton */}
          {Array.from({length: 5}).map((_, index) => (
            <View key={index} style={[styles.categoryButton, styles.loadingButton]} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* All Categories Button */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.selectedButton,
          ]}
          onPress={handleAllPress}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.selectedText,
            ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Category Buttons */}
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedButton,
            ]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedText,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
    },
    categoryButton: {
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedButton: {
      backgroundColor: theme.colors.primary.main,
      borderColor: theme.colors.primary.main,
    },
    categoryText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    selectedText: {
      color: theme.colors.primary.contrast,
      fontWeight: '600',
    },
    loadingButton: {
      backgroundColor: theme.colors.surface.tertiary,
      width: 80,
    },
  });

export default CategoryFilter;