import {configureStore, createSlice} from '@reduxjs/toolkit';

// Basit auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
  },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;