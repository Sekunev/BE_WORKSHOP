'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { blogService, Blog } from '@/lib/services/blog';
import { toast } from 'sonner';
import { Calendar, Clock, Eye, Heart, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);



  const loadBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getBlogs(page, 6);
      setBlogs(response.data.blogs);
      setHasMore(response.data.pages > page);
    } catch (error: unknown) {
      toast.error('Bloglar yüklenirken bir hata oluştu');
      console.error('Blog loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const response = await blogService.getBlogs(nextPage, 6);
      setBlogs(prev => [...prev, ...response.data.blogs]);
      setPage(nextPage);
      setHasMore(response.data.pages > nextPage);
    } catch (error: unknown) {
      toast.error('Daha fazla blog yüklenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Henüz blog bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                  <AvatarFallback className="text-xs">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{blog.author.name}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <CardTitle className="line-clamp-2 flex-1">
                  <Link 
                    href={`/blogs/${blog.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {blog.title}
                  </Link>
                </CardTitle>
                {blog.aiGenerated && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-shrink-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              
              <CardDescription className="line-clamp-3 text-sm text-gray-600">
                {blog.excerpt || 'Blog özeti mevcut değil...'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {blog.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{blog.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <Badge variant="outline" className="text-xs">
                  {blog.category}
                </Badge>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(blog.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{blog.readingTime} dk</span>
                    </div>
                  </div>
                  
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline">
            Daha Fazla Yükle
          </Button>
        </div>
      )}
    </div>
  );
}
