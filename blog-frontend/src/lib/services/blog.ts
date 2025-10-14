import api from '../api';

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  aiGenerated?: boolean;
  aiMetadata?: {
    konu: string;
    tarz: string;
    kelimeSayisi: number;
    hedefKitle: string;
    model: string;
    generatedAt: string;
  };
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished?: boolean;
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  id: string;
}

export interface BlogListResponse {
  status: string;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: {
    blogs: Blog[];
    pages: number;
  };
}

export interface Category {
  _id: string;
  count: number;
}

export interface Tag {
  _id: string;
  count: number;
}

export const blogService = {
  // Tüm blogları getir
  getBlogs: async (page = 1, limit = 10): Promise<BlogListResponse> => {
    const response = await api.get(`/blogs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Tek blog getir (slug ile)
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data.data.blog;
  },

  // Kullanıcının kendi bloglarını getir
  getMyBlogs: async (page = 1, limit = 10): Promise<BlogListResponse> => {
    const response = await api.get(`/blogs/my-blogs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Blog oluştur
  createBlog: async (data: CreateBlogRequest): Promise<Blog> => {
    const response = await api.post('/blogs', data);
    return response.data.data.blog;
  },

  // Blog güncelle
  updateBlog: async (data: UpdateBlogRequest): Promise<Blog> => {
    const { id, ...updateData } = data;
    const response = await api.put(`/blogs/${id}`, updateData);
    return response.data.data.blog;
  },

  // Blog sil
  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/blogs/${id}`);
  },

  // Blog beğen
  likeBlog: async (id: string): Promise<{ likeCount: number }> => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data.data;
  },

  // Kategorileri getir
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/blogs/categories');
    return response.data.data.categories;
  },

  // Popüler etiketleri getir
  getPopularTags: async (): Promise<Tag[]> => {
    const response = await api.get('/blogs/tags');
    return response.data.data.tags;
  },
};
