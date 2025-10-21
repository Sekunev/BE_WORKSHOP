import api from './api';

export interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  aiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface BlogsResponse {
  status: string;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: {
    blogs: Blog[];
  };
}

export interface BlogResponse {
  status: string;
  data: {
    blog: Blog;
  };
}

class BlogService {
  // Tüm blogları getir
  async getBlogs(page: number = 1, limit: number = 10): Promise<BlogsResponse> {
    try {
      const response = await api.get(`/blogs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Blog listesi alınamadı:', error);
      throw error;
    }
  }

  // Tek blog getir (slug ile)
  async getBlog(slug: string): Promise<BlogResponse> {
    try {
      const response = await api.get(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Blog alınamadı:', error);
      throw error;
    }
  }

  // ID ile blog getir (slug'a çevir)
  async getBlogById(id: string): Promise<BlogResponse> {
    try {
      // Önce tüm blogları getir ve ID'ye göre slug'ı bul
      const blogsResponse = await this.getBlogs(1, 100);
      const blog = blogsResponse.data.blogs.find(b => b._id === id);
      
      if (!blog) {
        throw new Error('Blog bulunamadı');
      }
      
      return this.getBlog(blog.slug);
    } catch (error) {
      console.error('Blog ID ile alınamadı:', error);
      throw error;
    }
  }

  // Blog ara
  async searchBlogs(query: string, page: number = 1): Promise<BlogsResponse> {
    try {
      const response = await api.get(`/blogs/search?q=${encodeURIComponent(query)}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Blog araması yapılamadı:', error);
      throw error;
    }
  }

  // Kategoriye göre blogları getir
  async getBlogsByCategory(category: string, page: number = 1): Promise<BlogsResponse> {
    try {
      const response = await api.get(`/blogs?category=${encodeURIComponent(category)}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Kategori blogları alınamadı:', error);
      throw error;
    }
  }

  // Blog beğen
  async likeBlog(id: string): Promise<void> {
    try {
      await api.post(`/blogs/${id}/like`);
    } catch (error) {
      console.error('Blog beğenilemedi:', error);
      throw error;
    }
  }

  // Blog görüntüleme sayısını artır (backend'de otomatik artırılıyor)
  async incrementViewCount(id: string): Promise<void> {
    // Backend'de blog detayı getirilirken otomatik artırılıyor
    // Bu fonksiyon şimdilik boş bırakılıyor
    console.log('View count incremented for blog:', id);
  }

  // Yeni blog oluştur
  async createBlog(blogData: {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    tags: string[];
    isPublished: boolean;
  }): Promise<BlogResponse> {
    try {
      const response = await api.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      console.error('Blog oluşturulamadı:', error);
      throw error;
    }
  }

  // Kullanıcının kendi bloglarını getir
  async getMyBlogs(page: number = 1, limit: number = 10): Promise<BlogsResponse> {
    try {
      const response = await api.get(`/blogs/my-blogs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Kendi bloglar alınamadı:', error);
      throw error;
    }
  }

  // Blog güncelle
  async updateBlog(id: string, blogData: {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    tags: string[];
    isPublished: boolean;
  }): Promise<BlogResponse> {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error('Blog güncellenemedi:', error);
      throw error;
    }
  }

  // Blog sil
  async deleteBlog(id: string): Promise<void> {
    try {
      await api.delete(`/blogs/${id}`);
    } catch (error) {
      console.error('Blog silinemedi:', error);
      throw error;
    }
  }
}

export const blogService = new BlogService();
export default blogService;