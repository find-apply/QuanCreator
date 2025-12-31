import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'app/store/store';
import type { SliceConfig } from 'app/store/types'; // Assuming this exists based on systemSlice
import type { AuthState, User } from 'features/auth/types';
import { authApi } from 'services/api/endpoints/auth';
import { z } from 'zod';

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
};

// Zod schema for persistence if needed (simplified for now)
const zAuthState = z.object({
  user: z.any().nullable(), // refine later
  token: z.string().nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

/** @knipignore */
export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('auth_token', action.payload);
      } else {
        localStorage.removeItem('auth_token');
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('auth_token', action.payload.token);
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('auth_token', action.payload.token);
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
      })
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

/** @knipignore */
export const { setToken, setUser, logout } = authSlice.actions;

/** @knipignore */
export const selectAuthSlice = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
/** @knipignore */
export const selectCurrentUser = (state: RootState) => state.auth.user;

export const authSliceConfig: SliceConfig<typeof authSlice> = {
  slice: authSlice,
  schema: zAuthState,
  getInitialState: () => initialAuthState,
  persistConfig: {
    persistDenylist: ['isLoading', 'error'],
    migrate: (state) => state as AuthState, // Simple migration
  },
};
