import { POWERUP } from '@mhd/shared';

import { publicProcedure, router } from './trpc';

export const appRouter = router({
  // Trivial query proving tRPC wiring + cross-package (@mhd/shared) import work.
  health: publicProcedure.query(() => ({
    ok: true,
    powerupCount: Object.keys(POWERUP).length,
  })),
});

export type AppRouter = typeof appRouter;
