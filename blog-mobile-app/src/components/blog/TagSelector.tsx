import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '@/contexts/ThemeContext';

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
}) => {
  const {theme} = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const styles = createStyles(theme);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      onTagsChange([...selectedTags, newTag.trim()]);
      setNewTag('');
      setIsModalVisible(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Tags</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.selectedTagsContainer}
        >
          {selectedTags.map((tag) => (
            <View key={tag} style={styles.selectedTag}>
              <Text style={styles.selectedTagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag)}
                style={styles.removeTagButton}
              >
                <Icon name="close" size={16} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Available Tags */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.availableTagsContainer}
      >
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.availableTag,
              selectedTags.includes(tag) && styles.selectedAvailableTag,
            ]}
            onPress={() => handleTagToggle(tag)}
          >
            <Text
              style={[
                styles.availableTagText,
                selectedTags.includes(tag) && styles.selectedAvailableTagText,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Tag Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Tag</Text>
            <TextInput
              style={styles.tagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Enter tag name..."
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewTag('');
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={handleAddNewTag}
                disabled={!newTag.trim()}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};const 
createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      marginLeft: 4,
    },
    selectedTagsContainer: {
      marginBottom: 8,
    },
    selectedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    selectedTagText: {
      fontSize: 12,
      color: theme.colors.background,
      marginRight: 4,
    },
    removeTagButton: {
      padding: 2,
    },
    availableTagsContainer: {
      flexGrow: 0,
    },
    availableTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedAvailableTag: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    availableTagText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    selectedAvailableTagText: {
      color: theme.colors.background,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    tagInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 10,
      marginRight: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    addTagButton: {
      flex: 1,
      paddingVertical: 10,
      marginLeft: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    addTagButtonText: {
      fontSize: 16,
      color: theme.colors.background,
      fontWeight: '500',
    },
  });

export default TagSelector;