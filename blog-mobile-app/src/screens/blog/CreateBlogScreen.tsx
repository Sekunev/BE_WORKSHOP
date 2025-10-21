import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { blogService } from '@/services/blogService';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const CATEGORIES = [
  'Teknoloji',
  'Yazılım Geliştirme',
  'Web Tasarım',
  'Mobil Uygulama',
  'Yapay Zeka',
  'Veri Bilimi',
  'Siber Güvenlik',
  'Diğer'
];

const CreateBlogScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Teknoloji',
    tags: '',
    isPublished: true,
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik alanları zorunludur');
      return;
    }

    if (formData.title.length < 5 || formData.title.length > 100) {
      Alert.alert('Hata', 'Başlık 5-100 karakter arasında olmalıdır');
      return;
    }

    if (formData.content.length < 50) {
      Alert.alert('Hata', 'İçerik en az 50 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      
      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + '...',
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublished: formData.isPublished,
      };

      await blogService.createBlog(blogData);
      
      Alert.alert(
        'Başarılı',
        formData.isPublished ? 'Blog yazısı yayınlandı!' : 'Blog yazısı taslak olarak kaydedildi!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Blog oluşturma hatası:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Blog yazısı oluşturulamadı'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setFormData({ ...formData, isPublished: false });
    setTimeout(() => handleSubmit(), 100);
  };

  const handlePublish = () => {
    setFormData({ ...formData, isPublished: true });
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Başlık */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Blog yazısının başlığını girin"
            maxLength={100}
          />
          <Text style={styles.charCount}>{formData.title.length}/100</Text>
        </View>

        {/* Özet */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Özet</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.excerpt}
            onChangeText={(text) => setFormData({ ...formData, excerpt: text })}
            placeholder="Blog yazısının kısa özeti (boş bırakılırsa otomatik oluşturulur)"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>{formData.excerpt.length}/200</Text>
        </View>

        {/* Kategori */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kategori *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Etiketler */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Etiketler</Text>
          <TextInput
            style={styles.input}
            value={formData.tags}
            onChangeText={(text) => setFormData({ ...formData, tags: text })}
            placeholder="Etiketleri virgülle ayırın (örn: react, javascript, web)"
          />
          <Text style={styles.helperText}>
            Etiketleri virgülle ayırın. Örnek: react, javascript, web
          </Text>
        </View>

        {/* İçerik */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>İçerik *</Text>
          <TextInput
            style={[styles.input, styles.contentArea]}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            placeholder="Blog yazısının içeriğini buraya yazın..."
            multiline
            numberOfLines={15}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{formData.content.length} karakter</Text>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={handleSaveDraft}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.draftButtonText]}>
              {loading && !formData.isPublished ? 'Kaydediliyor...' : 'Taslak Kaydet'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading && formData.isPublished ? (
              <ActivityIndicator size="small" color={COLORS.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Yayınla</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  form: {
    padding: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    backgroundColor: COLORS.background.card,
    color: COLORS.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  categoryButton: {
    backgroundColor: COLORS.background.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.accent.blue,
    borderColor: COLORS.accent.blue,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  categoryButtonTextActive: {
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  draftButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  publishButton: {
    backgroundColor: COLORS.accent.green,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text.inverse,
  },
  draftButtonText: {
    color: COLORS.text.primary,
  },
});

export default CreateBlogScreen;