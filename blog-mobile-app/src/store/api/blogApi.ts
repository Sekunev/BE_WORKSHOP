import {baseApi} from './baseApi';
import {Blog, BlogListResponse, BlogQueryParams, CreateBlogData, UpdateBlogData} from '@/types/blog';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get blogs with pagination and filters
    getBlogs: builder.query<BlogListResponse, BlogQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.category) searchParams.append('category', params.category);
        if (params.search) searchParams.append('search', params.search);
        if (params.author) searchParams.append('author', params.author);
        if (params.tags && params.tags.length > 0) {
          params.tags.forEach(tag => searchParams.append('tags', tag));
        }
        
        return {
          url: `/blogs?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.blogs.map(({id}) => ({type: 'Blog' as const, id})),
              {type: 'Blog', id: 'LIST'},
            ]
          : [{type: 'Blog', id: 'LIST'}],
    }),

    // Get single blog by slug
    getBlogBySlug: builder.query<Blog, string>({
      query: (slug) => ({
        url: `/blogs/${slug}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{type: 'Blog', id: result.id}] : [],
    }),

    // Create new blog
    createBlog: builder.mutation<Blog, CreateBlogData>({
      query: (blogData) => ({
        url: '/blogs',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: [{type: 'Blog', id: 'LIST'}],
    }),

    // Update blog
    updateBlog: builder.mutation<Blog, UpdateBlogData>({
      query: ({id, ...blogData}) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: blogData,
      }),
      invalidatesTags: (result) =>
        result ? [{type: 'Blog', id: result.id}, {type: 'Blog', id: 'LIST'}] : [],
    }),

    // Delete blog
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        {type: 'Blog', id},
        {type: 'Blog', id: 'LIST'},
      ],
    }),

    // Like/Unlike blog
    likeBlog: builder.mutation<{liked: boolean; likeCount: number}, string>({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{type: 'Blog', id}],
    }),

    // Unlike blog
    unlikeBlog: builder.mutation<{liked: boolean; likeCount: number}, string>({
      query: (id) => ({
        url: `/blogs/${id}/unlike`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{type: 'Blog', id}],
    }),

    // Get categories
    getCategories: builder.query<string[], void>({
      query: () => ({
        url: '/blogs/categories',
        method: 'GET',
      }),
      providesTags: [{type: 'Category', id: 'LIST'}],
    }),

    // Get tags
    getTags: builder.query<string[], void>({
      query: () => ({
        url: '/blogs/tags',
        method: 'GET',
      }),
      providesTags: [{type: 'Tag', id: 'LIST'}],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useLikeBlogMutation,
  useUnlikeBlogMutation,
  useGetCategoriesQuery,
  useGetTagsQuery,
} = blogApi;