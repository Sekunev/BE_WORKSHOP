import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserState, UserStats} from '@/types/user';
import {User} from '@/types/auth';

const initialState: UserState = {
  profile: null,
  stats: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = {...state.profile, ...action.payload};
      }
    },
    setStats: (state, action: PayloadAction<UserStats>) => {
      state.stats = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.stats = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setProfile,
  updateProfile,
  setStats,
  clearProfile,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;