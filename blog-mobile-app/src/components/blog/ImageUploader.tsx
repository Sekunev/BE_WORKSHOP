import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '@/contexts/ThemeContext';

interface ImageUploaderProps {
  imageUri?: string;
  onImageSelect: () => void;
  onImageRemove: () => void;
  label?: string;
  showCompressionInfo?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUri,
  onImageSelect,
  onImageRemove,
  label = 'Featured Image',
  showCompressionInfo = false,
}) => {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Remove', style: 'destructive', onPress: onImageRemove},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.image} />
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={onImageSelect}
            >
              <Icon name="edit" size={20} color={theme.colors.background} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
            >
              <Icon name="delete" size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={onImageSelect}>
          <Icon name="add-photo-alternate" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.uploadText}>Add Featured Image</Text>
          <Text style={styles.uploadSubtext}>Tap to select an image</Text>
          {showCompressionInfo && (
            <Text style={styles.compressionInfo}>
              Images will be automatically optimized
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    imageContainer: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
    },
    changeButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 20,
      padding: 8,
      marginRight: 8,
    },
    removeButton: {
      backgroundColor: 'rgba(255, 0, 0, 0.6)',
      borderRadius: 20,
      padding: 8,
    },
    uploadButton: {
      height: 200,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    uploadText: {
      fontSize: 16,
      color: theme.colors.text,
      marginTop: 8,
      fontWeight: '500',
    },
    uploadSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    compressionInfo: {
      fontSize: 12,
      color: theme.colors.primary,
      marginTop: 8,
      fontStyle: 'italic',
    },
  });

export default ImageUploader;