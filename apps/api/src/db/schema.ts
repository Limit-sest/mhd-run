import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

// ── Enums ───────────────────────────────────────────────────────────────────

export const cardType = pgEnum('card_type', ['task', 'curse']);
export const shopItemType = pgEnum('shop_item_type', ['transit', 'powerup']);
export const currency = pgEnum('currency', ['coin', 'gem']);
export const gameStatus = pgEnum('game_status', ['lobby', 'active', 'finished']);
export const teamRole = pgEnum('team_role', ['runners', 'catchers']);
export const teamCardStatus = pgEnum('team_card_status', [
  'active',
  'completed',
  'vetoed',
]);

// ── Content tables (seeded in Phase 2) ───────────────────────────────────────

export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  titleCs: text('title_cs').notNull(),
  // Nullable: blank EN falls back to CS at read time (see admin localization).
  titleEn: text('title_en'),
  descriptionCs: text('description_cs'),
  descriptionEn: text('description_en'),
  rewardCoins: integer('reward_coins').notNull().default(0),
  rewardGems: integer('reward_gems').notNull().default(0),
  type: cardType('type').notNull(),
  timerMinutes: integer('timer_minutes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const shopItems = pgTable('shop_items', {
  id: serial('id').primaryKey(),
  titleCs: text('title_cs').notNull(),
  // Nullable: blank EN falls back to CS at read time (see admin localization).
  titleEn: text('title_en'),
  descriptionCs: text('description_cs'),
  descriptionEn: text('description_en'),
  price: integer('price').notNull(),
  type: shopItemType('type').notNull(),
  currency: currency('currency').notNull(),
  icon: text('icon').notNull(),
  shareDescriptionCs: text('share_description_cs'),
  shareDescriptionEn: text('share_description_en'),
  timerMinutes: integer('timer_minutes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  titleCs: text('title_cs').notNull(),
  // Nullable: blank EN falls back to CS at read time (see admin localization).
  titleEn: text('title_en'),
  descriptionCs: text('description_cs'),
  descriptionEn: text('description_en'),
  plusCode: text('plus_code'),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  mapUrl: text('map_url'),
  category: text('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Game tables (defined now, used in Phase 3) ───────────────────────────────

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  status: gameStatus('status').notNull().default('lobby'),
  joinCode: text('join_code').notNull().unique(),
  winner: teamRole('winner'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export const teams = pgTable(
  'teams',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    role: teamRole('role').notNull(),
    balanceCoins: integer('balance_coins').notNull().default(70),
    balanceGems: integer('balance_gems').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    gameRoleUnique: unique('teams_game_role_unique').on(t.gameId, t.role),
  })
);

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isHost: boolean('is_host').notNull().default(false),
  sessionToken: text('session_token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const teamCards = pgTable('team_cards', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  cardId: integer('card_id')
    .notNull()
    .references(() => cards.id),
  status: teamCardStatus('status').notNull().default('active'),
  drawnAt: timestamp('drawn_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const teamPurchases = pgTable('team_purchases', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  shopItemId: integer('shop_item_id')
    .notNull()
    .references(() => shopItems.id),
  quantity: integer('quantity').notNull().default(1),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
});

export const gameTargets = pgTable('game_targets', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  locationId: integer('location_id')
    .notNull()
    .references(() => locations.id),
  distanceKm: numeric('distance_km', { precision: 5, scale: 2 }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
});
