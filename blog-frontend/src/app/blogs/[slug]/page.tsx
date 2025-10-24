'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { blogService, Blog } from '@/lib/services/blog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Sparkles,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MarkdownContent } from '@/components/blog/MarkdownContent';

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const params = useParams();
  const { user, isAuthenticated } = useAuth();

  const slug = params.slug as string;



  const loadBlog = useCallback(async () => {
    try {
      setIsLoading(true);
      const blogData = await blogService.getBlogBySlug(slug);
      setBlog(blogData);
    } catch (error: unknown) {
      toast.error('Blog yüklenirken bir hata oluştu');
      console.error('Blog loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug && slug !== 'undefined') {
      loadBlog();
    }
  }, [slug, loadBlog]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Beğenmek için giriş yapmalısınız');
      return;
    }

    try {
      setIsLiking(true);
      const response = await blogService.likeBlog(blog!._id);
      setBlog(prev => prev ? { ...prev, likeCount: response.likeCount } : null);
      toast.success('Blog beğenildi!');
    } catch (error: unknown) {
      toast.error('Blog beğenilirken bir hata oluştu');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link panoya kopyalandı!');
      } catch (error) {
        toast.error('Link kopyalanamadı');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız blog mevcut değil veya silinmiş olabilir.</p>
          <Link href="/blogs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Bloglara Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user?.id === blog.author._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Bloglara Dön
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                <AvatarFallback>
                  {blog.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{blog.author.name}</span>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{blog.title}</h1>
              {blog.aiGenerated && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI ile Oluşturuldu
                </Badge>
              )}
            </div>
            
            <p className="text-lg text-gray-600 mb-6">{blog.excerpt}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(blog.createdAt), 'dd MMMM yyyy', { locale: tr })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime} dk okuma</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount} görüntüleme</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline">{blog.category}</Badge>
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className="mr-2 h-4 w-4" />
                {blog.likeCount} Beğeni
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Paylaş
              </Button>

              {isAuthor && (
                <>
                  <Link href={`/edit/${blog._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <MarkdownContent 
              content={blog.content}
              className="max-w-none"
            />
            
            {/* AI Metadata */}
            {blog.aiGenerated && blog.aiMetadata && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <h3 className="text-base font-semibold text-purple-900">AI Blog Detayları</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex">
                    <span className="font-medium text-gray-700 min-w-[80px]">Konu:</span>
                    <span className="text-gray-600 truncate">{blog.aiMetadata.konu}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 min-w-[80px]">Tarz:</span>
                    <span className="text-gray-600 truncate">{blog.aiMetadata.tarz}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 min-w-[80px]">Kelime:</span>
                    <span className="text-gray-600">{blog.aiMetadata.kelimeSayisi}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 min-w-[80px]">Hedef:</span>
                    <span className="text-gray-600 truncate">{blog.aiMetadata.hedefKitle}</span>
                  </div>
                  <div className="md:col-span-2 flex">
                    <span className="font-medium text-gray-700 min-w-[80px]">Model:</span>
                    <span className="text-gray-600 text-xs font-mono">{blog.aiMetadata.model}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
              <AvatarFallback className="text-lg">
                {blog.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{blog.author.name}</h3>
              <p className="text-gray-600">Blog Yazarı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
