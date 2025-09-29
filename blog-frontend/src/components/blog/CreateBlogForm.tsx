'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
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
import { blogService } from '@/lib/services/blog';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';

const createBlogSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(200, 'Başlık en fazla 200 karakter olabilir'),
  content: z.string().min(1, 'İçerik gereklidir').min(100, 'İçerik en az 100 karakter olmalıdır'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'Kategori seçmelisiniz'),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

type CreateBlogFormData = z.infer<typeof createBlogSchema>;

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

export default function CreateBlogForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBlogFormData>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      isPublished: false,
    },
    mode: 'onChange',
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Otomatik excerpt oluştur
  const generateExcerpt = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, ''); // HTML tagları temizle
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit: SubmitHandler<CreateBlogFormData> = async (data: CreateBlogFormData) => {
    if (!isAuthenticated) {
      toast.error('Blog oluşturmak için giriş yapmalısınız');
      return;
    }

    setIsLoading(true);
    try {
      const blogData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || generateExcerpt(data.content),
        category: data.category,
        tags: tags,
        isPublished: data.isPublished,
      };

      const blog = await blogService.createBlog(blogData);
      toast.success('Blog başarıyla oluşturuldu!');
      router.push(`/blogs/${blog.slug}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Blog oluşturulurken bir hata oluştu';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Blog oluşturmak için giriş yapmalısınız.</p>
        <Button onClick={() => router.push('/auth/login')}>
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Blog Yazısı</CardTitle>
        <CardDescription>
          Blog yazınızı oluşturun ve yayınlayın
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
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
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
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              {...register('isPublished')}
              disabled={isLoading}
              className="rounded"
            />
            <Label htmlFor="isPublished">Hemen yayınla</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Blog Oluştur
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
