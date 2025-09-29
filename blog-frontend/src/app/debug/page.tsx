'use client';

import { useState, useEffect } from 'react';
import { blogService } from '@/lib/services/blog';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [blogs, setBlogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadBlogs();
    }
  }, [isAuthenticated]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getMyBlogs(1, 10);
      console.log('Debug - My Blogs Response:', response);
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Debug - Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Sayfası</h1>
        <p>Giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Sayfası</h1>
      
      <div className="mb-4">
        <p><strong>Kullanıcı:</strong> {user?.name} ({user?.email})</p>
        <p><strong>ID:</strong> {user?.id}</p>
      </div>

      <Button onClick={loadBlogs} className="mb-4">
        Blogları Yeniden Yükle
      </Button>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bloglar ({blogs.length})</h2>
          
          {blogs.map((blog) => (
            <Card key={blog._id}>
              <CardHeader>
                <CardTitle className="text-lg">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {blog._id}</p>
                  <p><strong>Slug:</strong> {blog.slug}</p>
                  <p><strong>Author ID:</strong> {blog.author._id}</p>
                  <p><strong>Author Name:</strong> {blog.author.name}</p>
                  <p><strong>Published:</strong> {blog.isPublished ? 'Evet' : 'Hayır'}</p>
                  <p><strong>Created:</strong> {new Date(blog.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="mt-4 space-x-2">
                  <Button asChild size="sm">
                    <a href={`/blogs/${blog.slug}`} target="_blank">
                      Blog Detayı
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/edit/${blog._id}`} target="_blank">
                      Düzenle
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
