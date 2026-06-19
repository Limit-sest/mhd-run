# MHD Run — Fullstack Migration Guide

Current state: Vue 3 SPA (Vite + Pinia + Tailwind), data from Google Sheets CSV, deployed on Vercel, location tracking via Hauk.

Target state: Fullstack app with server-authoritative game sessions, team sync, and real-time state — with an optional native Android build later.

---

## Architecture overview

```
monorepo/
├── apps/
│   ├── web/              ← current Vue 3 app (Vite + Capacitor later)
│   └── api/              ← Hono + tRPC + Drizzle + Socket.io
├── packages/
│   └── shared/           ← types, constants, game logic
├── drizzle/              ← DB migrations
└── package.json          ← workspace root (pnpm workspaces)
```

### Tech stack

| Layer          | Tech                         | Why                                                                      |
| -------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Frontend       | Vue 3, Vite, Pinia, Tailwind | Already in place, no change needed                                       |
| API framework  | Hono                         | Lightweight, runs on Vercel/Bun/Node/Edge, tRPC adapter available        |
| API layer      | tRPC (via trpc-hono)         | End-to-end type safety with Vue frontend, no codegen                     |
| ORM            | Drizzle                      | TS-native, schema-as-code, pairs with tRPC for DB-to-UI type flow        |
| Database       | PostgreSQL (Neon free tier)  | Handles game sessions, teams, cards, balances; free hosted option        |
| Real-time      | Socket.io                    | Team state sync, powerup events, tracker toggling; rooms = game sessions |
| Native (later) | Capacitor                    | Wraps the Vue SPA into an APK for background location + notifications    |

---

## Phase 1 — Monorepo setup

Convert the project into a pnpm workspace. Move the current app into `apps/web/`.

Steps:

1. Init pnpm workspace at root with `apps/*` and `packages/*`.
2. Move current source into `apps/web/`.
3. Create `packages/shared/` with a `tsconfig.json` and `package.json`. Move game types, constants, and pure logic (card drawing, penalty rules, price calculations) here.
4. Create `apps/api/` with Hono + tRPC skeleton.
5. Verify `pnpm dev` runs both apps (use `turbo` or `concurrently`).

**Exit criteria:** Existing app works unchanged from `apps/web/`, shared types import cleanly in both apps.

---

## Phase 2 — Database + seed data

Replace Google Sheets CSV with a real database.

### Schema (key tables)

```
cards          (id, type, title_cs, title_en, description_cs, description_en, reward_type, reward_amount, category)
shop_items     (id, type [transit|powerup], name_cs, name_en, description_cs, description_en, price, currency [coin|gem], icon, metadata)
locations      (id, name, plus_code, lat, lng, category)
games          (id, status [lobby|active|finished], created_at, started_at, finished_at, winner)
teams          (id, game_id, role [runners|catchers], balance_coins, balance_gems)
players        (id, team_id, name, is_host)
team_cards     (id, team_id, card_id, status [active|completed|vetoed], drawn_at, completed_at)
team_purchases (id, team_id, shop_item_id, purchased_at)
game_targets   (id, game_id, location_id, distance_km)
```

Steps:

1. Set up Neon Postgres (free tier) and add connection string to `.env`.
2. Define Drizzle schema in `apps/api/src/db/schema.ts`.
3. Write a seed script that reads the existing Google Sheets CSVs (or exported JSON) and populates `cards`, `shop_items`, and `locations`.
4. Run `drizzle-kit generate` + `drizzle-kit migrate`.

**Exit criteria:** All game content lives in Postgres. Seed script is repeatable.

---

## Phase 3 — API routes (tRPC)

Expose game logic as typed procedures.

### Router structure

```
trpc/
├── game.create()              → creates game, returns join code
├── game.join(code, teamRole)   → adds player to a team
├── game.start()               → game goes active, starts catcher timer
├── game.finish(winner)        → marks game as finished
├── team.drawCard()            → server picks a random undrawn card, returns it
├── team.completeCard(cardId)  → marks card done, awards reward
├── team.vetoCard(cardId)      → marks card vetoed, applies penalty
├── team.getHand()             → returns team's active + completed cards
├── shop.list()                → returns available shop items
├── shop.buy(itemId)           → deducts currency, records purchase
├── target.draw(distanceKm)    → picks a random location within radius
├── target.get()               → returns the team's target (runners only)
├── locations.list()           → all locations (for settings/admin)
└── cards.list()               → all cards (for admin)
```

Key design decisions:

- **Server-authoritative:** The server manages balances and card decks. The client can't award itself coins or re-draw cards. This prevents desync between team members and eliminates cheating.
- **Team-scoped:** Most operations are scoped to a team. Two runners see the same hand, same balance, same target.
- **Stateless auth (simple):** For v1, use a game join code. No user accounts needed. A session token (JWT or simple random ID) issued on `game.join` identifies the player for subsequent requests.

Steps:

1. Set up tRPC router in `apps/api/src/trpc/`.
2. Implement procedures one group at a time: game → team → shop → target.
3. Add a tRPC client in `apps/web/` (via `@trpc/client`).
4. Replace Pinia stores one by one: instead of localStorage-persisted local state, stores become thin wrappers around tRPC queries.

**Exit criteria:** A game can be created, joined, cards drawn, items bought — all through the API. Two browsers in the same team see the same state after refresh.

---

## Phase 4 — Real-time sync (Socket.io)

Make team state update live without polling.

### Events

```
Server → Client:
  card:drawn         { card, teamBalance }
  card:completed     { cardId, reward, teamBalance }
  card:vetoed        { cardId, penaltyEndsAt }
  shop:purchased     { item, teamBalance }
  powerup:activated  { powerup, affectedTeam, duration }
  game:started       { catcherStartTime }
  game:finished      { winner }
  penalty:started    { endsAt }
  penalty:ended      {}

Client → Server:
  join:room          { gameId, teamId }
```

Steps:

1. Add Socket.io server alongside Hono in `apps/api/`.
2. On every tRPC mutation that changes team state, emit the corresponding event to the team's room.
3. In `apps/web/`, connect on game join. Pinia stores listen to socket events and update reactively.
4. Handle reconnection — on reconnect, refetch full state via tRPC to catch up.

**Hosting note:** Vercel serverless can't hold WebSocket connections. Options:

- Deploy the API to **Fly.io** or **Railway** (free tier, always-on process). Keep the Vue frontend on Vercel.
- Or use **Ably/Pusher** as a managed WebSocket layer and keep everything on Vercel.

**Exit criteria:** Two browsers in the same team see card draws and purchases appear in real-time without refresh.

---

## Phase 5 — Frontend migration

Adapt the Vue app to work with the backend.

### Store-by-store migration

| Current store            | Migration                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `useAllCardsStore`       | Remove. Cards come from `cards.list()` (admin) or `team.drawCard()` (gameplay).                             |
| `useHandCardsStore`      | Thin wrapper around `team.getHand()` + socket events.                                                       |
| `useCompletedCardsStore` | Merged into `useHandCardsStore` (filtered by status).                                                       |
| `useShuffledCardsStore`  | Remove. Deck shuffling is server-side.                                                                      |
| `usePlayerStore`         | Stores player ID, team ID, game ID, session token. Still persisted locally.                                 |
| `useShopStore`           | Fetches from `shop.list()`, purchases via `shop.buy()`.                                                     |
| `useLocationsStore`      | Remove or keep for admin. Target drawn via `target.draw()`.                                                 |
| `useTimersStore`         | Keep for UI countdowns, but penalty start/end comes from the server.                                        |
| `useGameSettingsStore`   | Partially moves to server (game-level settings like distance). Local prefs (language, UI) stay client-side. |

### New stores

| Store            | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `useGameStore`   | Current game state: id, status, join code, teams, role. |
| `useSocketStore` | Socket.io connection state, reconnection logic.         |

### New views

- **LobbyView** — create/join game, see players, pick team, start game.
- **GameView** — wrapper that replaces the current top-level, shows team-appropriate UI.

Steps:

1. Add `useGameStore` and `useSocketStore`.
2. Add LobbyView with create/join flow.
3. Migrate stores one at a time, keeping the UI working at each step.
4. Remove Google Sheets fetch logic and CSV parsing (`papaparse` dependency).
5. Remove `pinia-plugin-persistedstate` from gameplay stores (only keep for local prefs).

**Exit criteria:** Full game loop works through the backend. No more Google Sheets dependency for gameplay.

---

## Phase 6 — Native Android (Capacitor)

Lower priority. Do this after the backend is stable.

Steps:

1. `npm install @capacitor/core @capacitor/cli` in `apps/web/`.
2. `npx cap init` + `npx cap add android`.
3. `vite build && npx cap sync` → open in Android Studio → build APK.
4. Add platform-aware composables:

| Feature               | Web fallback             | Native plugin                         |
| --------------------- | ------------------------ | ------------------------------------- |
| Location (foreground) | `navigator.geolocation`  | `@capacitor/geolocation`              |
| Location (background) | Hauk (external)          | Custom foreground service (see below) |
| Notifications         | Browser Notification API | `@capacitor/local-notifications`      |
| Keep awake            | Not available            | `@capacitor-community/keep-awake`     |

5. For background location (replacing Hauk), write a custom Capacitor plugin with an Android foreground service (~150 lines Kotlin). This is free, unlike `@transistorsoft`.
6. Abstract with composables:
   ```ts
   // composables/useLocation.ts — branches on Capacitor.isNativePlatform()
   ```

**Exit criteria:** APK installs and runs the full game. Background location works with screen locked.

---

## Deployment summary

| Component          | Host                                   | Cost      |
| ------------------ | -------------------------------------- | --------- |
| Vue frontend (web) | Vercel                                 | Free      |
| API + WebSocket    | Fly.io or Railway                      | Free tier |
| PostgreSQL         | Neon                                   | Free tier |
| APK distribution   | Sideload or Google Play ($25 one-time) | —         |

---

## What to do first

Phase 1 and 2 can be done in parallel. Start with the monorepo restructure and database schema — that's the foundation everything else builds on. Phase 3 is the bulk of the work. Phase 4 and 5 can overlap. Phase 6 is independent and can wait.
