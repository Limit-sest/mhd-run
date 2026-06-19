import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';

import { appRouter } from './trpc/router';

const app = new Hono();

app.get('/', (c) => c.text('mhd-run api'));

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
  })
);

export default {
  port: 3001,
  fetch: app.fetch,
};
