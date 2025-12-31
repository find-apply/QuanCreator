import type { LoginRequest, RegisterRequest, User } from 'features/auth/types';

import { api } from '..';

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{ token: string; user: User }, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['ClientState'],
    }),
    register: build.mutation<{ token: string; user: User }, RegisterRequest>({
      query: (data) => ({
        url: 'register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClientState'],
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      invalidatesTags: ['ClientState'],
    }),
    me: build.query<User, void>({
      query: () => ({
        url: 'user',
        method: 'GET',
      }),
      providesTags: ['ClientState'],
    }),
    getCsrfCookie: build.query<void, void>({
      query: () => ({
        url: '/sanctum/csrf-cookie',
        method: 'GET',
      }),
    }),
  }),
});

const { useLoginMutation, useRegisterMutation, useLogoutMutation, useMeQuery, useLazyMeQuery, useGetCsrfCookieQuery } =
  authApi;

export { useLoginMutation, useLogoutMutation, useRegisterMutation };
/** @knipignore */
export { useMeQuery };
/** @knipignore */
export { useLazyMeQuery };
/** @knipignore */
export { useGetCsrfCookieQuery };
