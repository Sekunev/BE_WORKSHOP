import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { socialService } from '@/services/socialService';
import { Blog } from '@/types/blog';

interface ShareButtonProps {
  blog: Blog;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onShare?: () => void;
}

interface ShareOption {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  blog,
  size = 'medium',
  showText = false,
  onShare,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 22;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const handleSharePress = () => {
    setModalVisible(true);
  };

  const handleShareOption = async (platform: string, shareFunction: () => Promise<void>) => {
    try {
      setModalVisible(false);
      await shareFunction();
      onShare?.();
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      title: 'WhatsApp',
      icon: 'message',
      color: '#25D366',
      onPress: () => handleShareOption('whatsapp', () => socialService.shareBlogToPlatform(blog, 'whatsapp')),
    },
    {
      title: 'Twitter',
      icon: 'alternate-email',
      color: '#1DA1F2',
      onPress: () => handleShareOption('twitter', () => socialService.shareBlogToPlatform(blog, 'twitter')),
    },
    {
      title: 'Facebook',
      icon: 'facebook',
      color: '#4267B2',
      onPress: () => handleShareOption('facebook', () => socialService.shareBlogToPlatform(blog, 'facebook')),
    },
    {
      title: 'E-posta',
      icon: 'email',
      color: '#EA4335',
      onPress: () => handleShareOption('email', () => socialService.shareBlogToPlatform(blog, 'email')),
    },
    {
      title: 'Diğer',
      icon: 'share',
      color: theme.colors.primary,
      onPress: () => handleShareOption('other', () => socialService.shareBlog(blog)),
    },
  ];

  const copyToClipboard = async () => {
    try {
      const shareUrl = `https://yourblog.com/blog/${blog.slug}`;
      // Note: You might want to use @react-native-clipboard/clipboard for this
      // For now, we'll just show a toast
      showToast('Link kopyalandı', 'success');
      setModalVisible(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Link kopyalanırken hata oluştu', 'error');
    }
  };

  const renderShareOption = (option: ShareOption, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.shareOption, { borderBottomColor: theme.colors.border }]}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.shareIconContainer, { backgroundColor: `${option.color}20` }]}>
        <Icon name={option.icon} size={24} color={option.color} />
      </View>
      <Text style={[styles.shareOptionText, { color: theme.colors.text }]}>
        {option.title}
      </Text>
      <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handleSharePress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Icon
            name="share"
            size={getIconSize()}
            color={theme.colors.textSecondary}
          />
          {showText && (
            <Text
              style={[
                styles.shareText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: getTextSize(),
                  marginLeft: size === 'small' ? 4 : 6,
                },
              ]}
            >
              Paylaş
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Blog Paylaş
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Blog Info */}
            <View style={styles.blogInfo}>
              <Text
                style={[styles.blogTitle, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {blog.title}
              </Text>
              {blog.excerpt && (
                <Text
                  style={[styles.blogExcerpt, { color: theme.colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {blog.excerpt}
                </Text>
              )}
            </View>

            {/* Share Options */}
            <ScrollView style={styles.shareOptionsContainer}>
              {shareOptions.map(renderShareOption)}
              
              {/* Copy Link Option */}
              <TouchableOpacity
                style={[styles.shareOption, { borderBottomColor: theme.colors.border }]}
                onPress={copyToClipboard}
                activeOpacity={0.7}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: `${theme.colors.info}20` }]}>
                  <Icon name="link" size={24} color={theme.colors.info} />
                </View>
                <Text style={[styles.shareOptionText, { color: theme.colors.text }]}>
                  Linki Kopyala
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                İptal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shareText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  blogInfo: {
    padding: 20,
    paddingBottom: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  shareOptionsContainer: {
    maxHeight: 300,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  shareIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareButton;