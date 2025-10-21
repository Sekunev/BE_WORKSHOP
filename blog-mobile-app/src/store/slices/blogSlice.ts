import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BlogState, Blog} from '@/types/blog';

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  categories: [],
  tags: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  },
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
    },
    appendBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = [...state.blogs, ...action.payload];
    },
    setCurrentBlog: (state, action: PayloadAction<Blog | null>) => {
      state.currentBlog = action.payload;
    },
    updateBlog: (state, action: PayloadAction<Blog>) => {
      const index = state.blogs.findIndex(blog => blog.id === action.payload.id);
      if (index !== -1) {
        state.blogs[index] = action.payload;
      }
      if (state.currentBlog?.id === action.payload.id) {
        state.currentBlog = action.payload;
      }
    },
    removeBlog: (state, action: PayloadAction<string>) => {
      state.blogs = state.blogs.filter(blog => blog.id !== action.payload);
      if (state.currentBlog?.id === action.payload) {
        state.currentBlog = null;
      }
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<BlogState['pagination']>>) => {
      state.pagination = {...state.pagination, ...action.payload};
    },
    clearBlogs: (state) => {
      state.blogs = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setBlogs,
  appendBlogs,
  setCurrentBlog,
  updateBlog,
  removeBlog,
  setCategories,
  setTags,
  setPagination,
  clearBlogs,
  clearError,
} = blogSlice.actions;

export default blogSlice.reducer;