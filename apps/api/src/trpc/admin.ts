import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../db';
import { cards, shopItems } from '../db/schema';
import { adminProcedure, publicProcedure, router } from './trpc';

const optionalText = z.string().trim().nullish();
const optionalInt = z.number().int().nullish();

const cardInput = z.object({
  titleCs: z.string().trim().min(1),
  titleEn: optionalText,
  descriptionCs: optionalText,
  descriptionEn: optionalText,
  rewardCoins: z.number().int().min(0),
  rewardGems: z.number().int().min(0),
  type: z.enum(['task', 'curse']),
  timerMinutes: optionalInt,
});

const shopInput = z.object({
  titleCs: z.string().trim().min(1),
  titleEn: optionalText,
  descriptionCs: optionalText,
  descriptionEn: optionalText,
  price: z.number().int().min(0),
  type: z.enum(['transit', 'powerup']),
  currency: z.enum(['coin', 'gem']),
  icon: z.string().trim(),
  shareDescriptionCs: optionalText,
  shareDescriptionEn: optionalText,
  timerMinutes: optionalInt,
});

const idInput = z.object({ id: z.number().int() });

/** Empty/whitespace → null, otherwise trimmed. */
function clean(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length ? trimmed : null;
}

// English fields are optional. We store exactly what was entered (blank → null)
// so they keep tracking the Czech value via the read-time fallback below; this
// means editing the Czech later is always reflected and never goes stale.
function cardValues(input: z.infer<typeof cardInput>) {
  return {
    titleCs: input.titleCs,
    titleEn: clean(input.titleEn),
    descriptionCs: clean(input.descriptionCs),
    descriptionEn: clean(input.descriptionEn),
    rewardCoins: input.rewardCoins,
    rewardGems: input.rewardGems,
    type: input.type,
    timerMinutes: input.timerMinutes ?? null,
  };
}

function shopValues(input: z.infer<typeof shopInput>) {
  return {
    titleCs: input.titleCs,
    titleEn: clean(input.titleEn),
    descriptionCs: clean(input.descriptionCs),
    descriptionEn: clean(input.descriptionEn),
    price: input.price,
    type: input.type,
    currency: input.currency,
    icon: input.icon,
    shareDescriptionCs: clean(input.shareDescriptionCs),
    shareDescriptionEn: clean(input.shareDescriptionEn),
    timerMinutes: input.timerMinutes ?? null,
  };
}

export const adminRouter = router({
  // Public: validate the password and hand back a token (the password itself).
  login: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(({ input }) => {
      if (!process.env.ADMIN_PASSWORD || input.password !== process.env.ADMIN_PASSWORD) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password' });
      }
      return { token: input.password };
    }),

  // Cheap protected query the client uses to verify a stored token on load.
  session: adminProcedure.query(() => ({ ok: true })),

  cards: router({
    list: adminProcedure.query(() => db.select().from(cards).orderBy(cards.id)),
    create: adminProcedure.input(cardInput).mutation(async ({ input }) => {
      const [row] = await db.insert(cards).values(cardValues(input)).returning();
      return row;
    }),
    update: adminProcedure
      .input(cardInput.extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        const [row] = await db
          .update(cards)
          .set(cardValues(rest))
          .where(eq(cards.id, id))
          .returning();
        if (!row) throw new TRPCError({ code: 'NOT_FOUND' });
        return row;
      }),
    delete: adminProcedure.input(idInput).mutation(async ({ input }) => {
      await db.delete(cards).where(eq(cards.id, input.id));
      return { ok: true };
    }),
  }),

  shop: router({
    list: adminProcedure.query(() => db.select().from(shopItems).orderBy(shopItems.id)),
    create: adminProcedure.input(shopInput).mutation(async ({ input }) => {
      const [row] = await db.insert(shopItems).values(shopValues(input)).returning();
      return row;
    }),
    update: adminProcedure
      .input(shopInput.extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        const [row] = await db
          .update(shopItems)
          .set(shopValues(rest))
          .where(eq(shopItems.id, id))
          .returning();
        if (!row) throw new TRPCError({ code: 'NOT_FOUND' });
        return row;
      }),
    delete: adminProcedure.input(idInput).mutation(async ({ input }) => {
      await db.delete(shopItems).where(eq(shopItems.id, input.id));
      return { ok: true };
    }),
  }),
});
