// Blog related types
import {User} from './auth';

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: User;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  readingTime: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  id: string;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tags?: string[];
  author?: string;
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  categories: string[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}