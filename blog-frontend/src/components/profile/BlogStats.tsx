'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogService } from '@/lib/services/blog';
import { toast } from 'sonner';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentBlogs: unknown[];
}

export default function BlogStats() {
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentBlogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlogStats();
  }, []);

  const loadBlogStats = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getMyBlogs(1, 10);
      
      const blogs = response.data.blogs;
      const totalViews = blogs.reduce((sum: number, blog: unknown) => sum + (blog as { viewCount: number }).viewCount, 0);
      const totalLikes = blogs.reduce((sum: number, blog: unknown) => sum + (blog as { likeCount: number }).likeCount, 0);
      const totalComments = blogs.reduce((sum: number, blog: unknown) => sum + (blog as { commentCount: number }).commentCount, 0);

      setStats({
        totalBlogs: response.data.blogs.length,
        totalViews,
        totalLikes,
        totalComments,
        recentBlogs: blogs.slice(0, 5),
      });
    } catch (error: unknown) {
      toast.error('Blog istatistikleri yüklenirken bir hata oluştu');
      console.error('Blog stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      title: 'Toplam Blog',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Toplam Görüntüleme',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Toplam Beğeni',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Toplam Yorum',
      value: stats.totalComments,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Blog İstatistikleri</span>
        </CardTitle>
        <CardDescription>
          Blog performansınızın özeti
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statItems.map((item, index) => (
            <div key={index} className={`${item.bgColor} p-4 rounded-lg text-center`}>
              <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-sm text-gray-600">{item.title}</div>
            </div>
          ))}
        </div>

        {/* Son Bloglar */}
        {stats.recentBlogs.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Son Bloglar</h4>
            <div className="space-y-3">
              {stats.recentBlogs.map((blog) => (
                <div key={blog._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm line-clamp-1">{blog.title}</h5>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(blog.createdAt), 'dd MMM', { locale: tr })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{blog.viewCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{blog.likeCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={blog.isPublished ? "default" : "secondary"} className="text-xs">
                      {blog.isPublished ? "Yayında" : "Taslak"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {blog.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentBlogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz blog yazmamışsınız.</p>
            <p className="text-sm">İlk blogunuzu yazarak başlayın!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
