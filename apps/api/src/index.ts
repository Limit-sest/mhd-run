import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { isValidToken } from './trpc/context';
import { appRouter } from './trpc/router';

const app = new Hono();

app.get('/', (c) => c.text('mhd-run api'));

app.use(
  '/trpc/*',
  cors({
    origin: (origin) => origin ?? '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (opts) => {
      const auth = opts.req.headers.get('authorization');
      const token = auth?.replace(/^Bearer\s+/i, '');
      return { isAdmin: isValidToken(token) };
    },
  })
);

export default {
  port: 3001,
  fetch: app.fetch,
};
