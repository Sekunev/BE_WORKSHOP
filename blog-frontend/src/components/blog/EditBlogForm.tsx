'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { blogService, Blog } from '@/lib/services/blog';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';

const editBlogSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(200, 'Başlık en fazla 200 karakter olabilir'),
  content: z.string().min(1, 'İçerik gereklidir').min(100, 'İçerik en az 100 karakter olmalıdır'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'Kategori seçmelisiniz'),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

const categories = [
  'Teknoloji',
  'Yazılım Geliştirme',
  'Web Tasarım',
  'Mobil Uygulama',
  'Yapay Zeka',
  'Veri Bilimi',
  'Siber Güvenlik',
  'Diğer'
];

interface EditBlogFormProps {
  blogId: string;
}

export default function EditBlogForm({ blogId }: EditBlogFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [blog, setBlog] = useState<Blog | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditBlogFormData>({
    resolver: zodResolver(editBlogSchema),
  });

  const watchedContent = watch('content');

  useEffect(() => {
    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      
      // Önce tüm blogları getirip ID'ye göre bul
      const response = await blogService.getMyBlogs(1, 100);
      const foundBlog = response.data.blogs.find((b: Blog) => b._id === blogId);
      
      if (!foundBlog) {
        toast.error('Blog bulunamadı veya bu blog size ait değil');
        router.push('/dashboard');
        return;
      }

      setBlog(foundBlog);
      
      // Form değerlerini set et
      setValue('title', foundBlog.title);
      setValue('content', foundBlog.content);
      setValue('excerpt', foundBlog.excerpt);
      setValue('category', foundBlog.category);
      setValue('isPublished', foundBlog.isPublished);
      
      setTags(foundBlog.tags || []);
      setValue('tags', (foundBlog.tags || []).join(','));
    } catch (error: unknown) {
      toast.error('Blog yüklenirken bir hata oluştu');
      console.error('Blog loading error:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const generateExcerpt = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags.join(','));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags.join(','));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: EditBlogFormData) => {
    if (!isAuthenticated || !blog) {
      toast.error('Blog düzenlemek için giriş yapmalısınız');
      return;
    }

    setIsSaving(true);
    try {
      const blogData = {
        id: blog._id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || generateExcerpt(data.content),
        category: data.category,
        tags: tags,
        isPublished: data.isPublished,
      };

      await blogService.updateBlog(blogData);
      toast.success('Blog başarıyla güncellendi!');
      router.push(`/blogs/${blog.slug}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Blog güncellenirken bir hata oluştu';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Blog düzenlemek için giriş yapmalısınız.</p>
        <Button onClick={() => router.push('/auth/login')}>
          Giriş Yap
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Blog bulunamadı.</p>
        <Button onClick={() => router.push('/dashboard')}>
          Dashboard'a Dön
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Blog Düzenle</CardTitle>
        <CardDescription>
          Blog yazınızı düzenleyin ve güncelleyin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Blog başlığını giriniz"
              {...register('title')}
              disabled={isSaving}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select 
              defaultValue={blog.category}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                placeholder="Etiket ekleyin ve Enter'a basın"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Özet</Label>
            <Textarea
              id="excerpt"
              placeholder="Blog özetini giriniz (otomatik oluşturulacak)"
              {...register('excerpt')}
              disabled={isSaving}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              Özet girmezseniz içeriğinizden otomatik oluşturulacaktır.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">İçerik *</Label>
            <Textarea
              id="content"
              placeholder="Blog içeriğinizi yazınız..."
              {...register('content')}
              disabled={isSaving}
              rows={15}
              className="min-h-[400px]"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Kelime sayısı: {watchedContent?.split(' ').length || 0}
            </p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              defaultChecked={blog.isPublished}
              {...register('isPublished')}
              disabled={isSaving}
              className="rounded"
            />
            <Label htmlFor="isPublished">Yayınla</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Güncelle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
