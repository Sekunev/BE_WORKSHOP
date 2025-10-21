import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '@/contexts/ThemeContext';

interface MarkdownShortcutsProps {
  onShortcutPress: (shortcut: string) => void;
}

const MarkdownShortcuts: React.FC<MarkdownShortcutsProps> = ({onShortcutPress}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const shortcuts = [
    {id: 'bold', label: 'Bold', shortcut: '**text**', icon: 'format-bold'},
    {id: 'italic', label: 'Italic', shortcut: '*text*', icon: 'format-italic'},
    {id: 'heading1', label: 'H1', shortcut: '# ', icon: 'title'},
    {id: 'heading2', label: 'H2', shortcut: '## ', icon: 'title'},
    {id: 'link', label: 'Link', shortcut: '[text](url)', icon: 'link'},
    {id: 'list', label: 'List', shortcut: '- ', icon: 'format-list-bulleted'},
    {id: 'quote', label: 'Quote', shortcut: '> ', icon: 'format-quote'},
    {id: 'code', label: 'Code', shortcut: '`code`', icon: 'code'},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Markdown Shortcuts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.shortcutsContainer}>
          {shortcuts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.shortcutButton}
              onPress={() => onShortcutPress(item.shortcut)}
            >
              <Icon name={item.icon} size={16} color={theme.colors.primary} />
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    shortcutsContainer: {
      flexDirection: 'row',
      paddingRight: 16,
    },
    shortcutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    shortcutLabel: {
      fontSize: 12,
      color: theme.colors.text,
      marginLeft: 4,
    },
  });

export default MarkdownShortcuts;