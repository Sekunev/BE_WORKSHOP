import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, User, AuthResponse} from '@/types/auth';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      const {user, accessToken, refreshToken} = action.payload;
      state.user = user;
      state.accessToken = accessToken.token;
      state.refreshToken = refreshToken.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{accessToken: string; refreshToken: string}>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setAuth,
  setTokens,
  setUser,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;