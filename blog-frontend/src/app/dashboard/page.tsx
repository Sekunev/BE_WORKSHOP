'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { blogService, Blog } from '@/lib/services/blog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Calendar,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    loadMyBlogs();
  }, [isAuthenticated, router]);

  const loadMyBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getMyBlogs(1, 10);
      setBlogs(response.data.blogs);
      
      // Stats hesapla
      const totalViews = response.data.blogs.reduce((sum, blog) => sum + blog.viewCount, 0);
      const totalLikes = response.data.blogs.reduce((sum, blog) => sum + blog.likeCount, 0);
      
      setStats({
        totalBlogs: response.data.blogs.length,
        totalViews,
        totalLikes,
      });
    } catch (error: unknown) {
      toast.error('Bloglar yüklenirken bir hata oluştu');
      console.error('Blog loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Bu blogu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await blogService.deleteBlog(blogId);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      setStats(prev => ({ ...prev, totalBlogs: prev.totalBlogs - 1 }));
      toast.success('Blog başarıyla silindi');
    } catch (error: unknown) {
      toast.error('Blog silinirken bir hata oluştu');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Hoş geldiniz, {user?.name}! Blog istatistiklerinizi ve yönetim panelinizi görüntüleyin.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Blog</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Yayınlanan blog sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Tüm bloglarınızın toplam görüntülenmesi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Beğeni</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Tüm bloglarınızın toplam beğenisi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bloglarım</h2>
          <Link href="/blogs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Blog
            </Button>
          </Link>
        </div>

        {/* Blog List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz blog yok</h3>
              <p className="text-gray-600 mb-4">İlk blogunuzu yazarak başlayın!</p>
              <Link href="/blogs/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Blogumu Yaz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={blog.isPublished ? "default" : "secondary"}>
                      {blog.isPublished ? "Yayında" : "Taslak"}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(blog.createdAt), 'dd MMM', { locale: tr })}
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="line-clamp-2">
                    <Link 
                      href={`/blogs/${blog.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {blog.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Category */}
                    <Badge variant="outline" className="text-xs">
                      {blog.category}
                    </Badge>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{blog.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{blog.likeCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/blogs/${blog.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Button>
                      </Link>
                      <Link href={`/edit/${blog._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteBlog(blog._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
