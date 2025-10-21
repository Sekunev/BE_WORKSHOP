import {baseApi} from './baseApi';
import {User} from '@/types/auth';
import {UpdateProfileData, ChangePasswordData, UserStats} from '@/types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query<User, void>({
      query: () => ({
        url: '/user/profile',
        method: 'GET',
      }),
      providesTags: [{type: 'User', id: 'PROFILE'}],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (profileData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: [{type: 'User', id: 'PROFILE'}],
    }),

    // Change password
    changePassword: builder.mutation<{message: string}, ChangePasswordData>({
      query: (passwordData) => ({
        url: '/user/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Upload avatar
    uploadAvatar: builder.mutation<{avatarUrl: string}, FormData>({
      query: (formData) => ({
        url: '/user/avatar',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{type: 'User', id: 'PROFILE'}],
    }),

    // Get user statistics
    getUserStats: builder.query<UserStats, void>({
      query: () => ({
        url: '/user/stats',
        method: 'GET',
      }),
      providesTags: [{type: 'User', id: 'STATS'}],
    }),

    // Get user's blogs
    getUserBlogs: builder.query<{blogs: any[], pagination: any}, {page?: number; limit?: number}>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        return {
          url: `/user/blogs?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [{type: 'Blog', id: 'USER_BLOGS'}],
    }),

    // Get recent activity
    getRecentActivity: builder.query<any[], void>({
      query: () => ({
        url: '/user/activity',
        method: 'GET',
      }),
      providesTags: [{type: 'User', id: 'ACTIVITY'}],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetUserStatsQuery,
  useGetUserBlogsQuery,
  useGetRecentActivityQuery,
} = userApi;