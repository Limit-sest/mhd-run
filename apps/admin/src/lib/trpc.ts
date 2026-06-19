import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@mhd/api/trpc/router';

import { getToken } from '@/composables/useAuth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers() {
        const token = getToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof TRPCClientError &&
    error.data?.code === 'UNAUTHORIZED'
  );
}
