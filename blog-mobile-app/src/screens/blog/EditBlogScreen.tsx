import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { blogService, Blog } from '@/services/blogService';
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

interface EditBlogRouteParams {
  blogId: string;
}

const EditBlogScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params as EditBlogRouteParams;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Teknoloji',
    tags: '',
    isPublished: true,
  });

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(blogId);
      const blogData = response.data.blog;
      
      setBlog(blogData);
      setFormData({
        title: blogData.title,
        content: blogData.content || blogData.excerpt,
        excerpt: blogData.excerpt,
        category: blogData.category,
        tags: blogData.tags.join(', '),
        isPublished: blogData.isPublished,
      });
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
      Alert.alert('Hata', 'Blog yüklenemedi', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (publish: boolean) => {
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
      setSaving(true);
      
      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + '...',
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublished: publish,
      };

      await blogService.updateBlog(blog!._id, blogData);
      
      Alert.alert(
        'Başarılı',
        publish ? 'Blog yazısı güncellendi ve yayınlandı!' : 'Blog yazısı taslak olarak güncellendi!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Blog güncelleme hatası:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Blog yazısı güncellenemedi'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => handleSubmit(false);
  const handlePublish = () => handleSubmit(true);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Blog yükleniyor...</Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Blog bulunamadı</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            placeholder="Blog yazısının kısa özeti"
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
            placeholder="Etiketleri virgülle ayırın"
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

        {/* Durum Bilgisi */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Mevcut Durum:</Text>
          <View style={[
            styles.statusBadge,
            blog.isPublished ? styles.publishedBadge : styles.draftBadge
          ]}>
            <Text style={[
              styles.statusText,
              blog.isPublished ? styles.publishedText : styles.draftText
            ]}>
              {blog.isPublished ? 'Yayında' : 'Taslak'}
            </Text>
          </View>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={handleSaveDraft}
            disabled={saving}
          >
            <Text style={[styles.buttonText, styles.draftButtonText]}>
              {saving && !formData.isPublished ? 'Kaydediliyor...' : 'Taslak Kaydet'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={handlePublish}
            disabled={saving}
          >
            {saving && formData.isPublished ? (
              <ActivityIndicator size="small" color={COLORS.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Güncelle & Yayınla</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
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
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    backgroundColor: COLORS.background.primary,
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  categoryButtonTextActive: {
    color: COLORS.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    marginRight: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: COLORS.success,
  },
  draftBadge: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  publishedText: {
    color: COLORS.text.inverse,
  },
  draftText: {
    color: COLORS.text.inverse,
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
    backgroundColor: COLORS.primary,
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

export default EditBlogScreen;