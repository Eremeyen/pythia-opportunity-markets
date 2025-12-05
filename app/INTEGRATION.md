# INTEGRATION.md — Mocked UI Inventory and Integration Mapping

## Deliverable scope

- Inventory every mocked/placeholder behavior with exact file locations and what to edit
- Map each UI action to backend and on-chain program calls with file references
- Call out redundancies in data sources and types; propose unified interfaces and hook contracts

## Global mock sources (to replace)

- `app/src/config/mockMarkets.ts`
- `app/src/config/mockPositions.ts`
- `app/src/config/mockSponsors.ts`
- `app/src/config/mockSponsorMarkets.ts`
- `app/src/config/mockTrades.ts`
- Hooks reading or synthesizing mocks:
    - `app/src/hooks/useMockSponsorData.ts`
    - `app/src/hooks/useMarket.ts`
    - `app/src/hooks/usePortfolioBalance.ts`
    - `app/src/hooks/useCumulativePnl.ts`

## Pages — mocked/placeholder behaviors and exact edits

- Trending Markets — `app/src/pages/TrendingMarkets.tsx`
    - Current: `getSponsorMarketsFiltered(scope)` from `config/mockSponsorMarkets` (filters by time-window)
    - Edit: replace with `useMarkets(scope)` backed by backend/indexer (pending); hydrate price, window state, attention
    - Touchpoints: update `MarketPreviewCard` consumer to accept unified `MarketSummary`

- Sponsors — `app/src/pages/Sponsors.tsx`
    - Current: `MOCK_SPONSORS` from `config/mockSponsors` (TODO present to use a hook)
    - Edit: add `useSponsors()` fetching sponsors and their markets from backend; map to `MarketSummary`

- Market Details — `app/src/pages/MarketDetails.tsx`
    - Current: `useMarket(id)` returns synthetic `Market`; Buy YES/NO buttons are no-ops; note: “Trading is mocked in v1.”
    - Edit: replace with `useMarketById(id)` (backend/indexer). Wire buttons:
        - Private window → on-chain `trade_private` (encrypted)
        - Public window → on-chain `trade_public`
    - Also surface window switching status and disable actions appropriately

- For Sponsors — `app/src/pages/ForSponsors.tsx`
    - Current: `useSponsorMarkets()` wraps `useMockSponsorData` for markets/create/resolve/selection; `TradeFeed` uses `useMockTrades` to simulate trades; viewer path handlers are no-ops
    - Edit: replace with `useSponsorData()` that calls backend + on-chain:
        - Create → `init_market` then `init_market_encrypted`
        - Resolve → `resolve_market` (enforce resolution date)
        - Optional: window controls → `switch_to_public` / `switch_to_private`
        - Trades → subscribe to WS/on-chain events instead of local simulation

- Profile — `app/src/pages/Profile.tsx`
    - Current: `getPositions()` from `config/mockPositions`; claim toggles local state; balance/PnL hooks compute from mocks
    - Edit: fetch positions from backend/indexer; wire Claim to on-chain (requires `claim_payout` implementation or backend settlement flow)

## Components — mocked/placeholder behaviors and edits

- `app/src/components/MarketPreviewCard.tsx`
    - Current: fed by mocks; comment warns ID type may change
    - Edit: ensure ids map to Market PDA or backend id; use `MarketSummary`

- `app/src/components/SponsorMarketForm.tsx`
    - Current: calls `onCreate` from mock hook
    - Edit: call backend endpoint that performs `init_market` + `init_market_encrypted`; return created market id

- `app/src/components/SponsorMarketDetails.tsx`
    - Current: shows “Resolve…” only; no on-chain call
    - Edit: call `resolve_market`; surface window timers from chain and disable as needed

- `app/src/components/TradeFeed.tsx`
    - Current: simulates trades via interval (via `hooks/useMockTrades`)
    - Edit: subscribe to backend WS stream of `TradeEvent`/`WindowSwitchEvent` or RPC logs; stop local ticking

- `app/src/components/PositionCard.tsx`
    - Current: claim button calls parent `onClaim` which flips mock state
    - Edit: route to backend/chain claim endpoint; hide values during private window

- `app/src/components/PageHeader.tsx`
    - Current: Privy auth UI; TODO for toast on `!ready`. Wallet/tx context exists via `providers/SolanaKitProvider.tsx` (bridges Privy to Solana/Kit); PageHeader itself still uses Privy directly.
    - Edit: ensure consumers use `useSolanaKit()` where tx signing is needed; surface toast on `!ready`

## Provider — wallet/tx context

- `app/src/providers/SolanaKitProvider.tsx`
    - Current: exposes `rpc`, `rpcSubscriptions`, `sendAndConfirm`, `signTransaction`, `signAndSendTransaction`, `wallet`, `address`, `latestBlockhash`, `ready`, `authenticated` via `useSolanaKit()`. Configured by `NETWORK` and `VITE_SOLANA_*` envs and wired in `app/src/main.tsx`.
    - Impact: hooks/pages that need tx signing should consume `useSolanaKit()` instead of accessing Privy directly.

## Hooks — usage map, current mocks, and replacements

Hook usage matrix (where used → what it reads now → what to build):

- useMockSponsorData — `app/src/hooks/useMockSponsorData.ts`
    - Used by: wrapped by `useSponsorMarkets` → `app/src/pages/ForSponsors.tsx`
    - Reads: `config/mockSponsorMarkets`, `config/mockTrades` (local in-memory)
    - Build: `useSponsorData` backed by backend + Anchor; remove simulated trades

- useMarket — `app/src/hooks/useMarket.ts`
    - Used by: `app/src/pages/MarketDetails.tsx`
    - Reads: looks up `MOCK_SPONSOR_MARKETS` first; falls back to adapting from `config/mockMarkets`
    - Build: `useMarketById(id)` fetching from backend/indexer (PDA or backend id)

- usePortfolioBalance — `app/src/hooks/usePortfolioBalance.ts`
    - Used by: `app/src/pages/Profile.tsx`
    - Reads: `config/mockPositions`; placeholder owed amounts
    - Build: compute from `usePositions(owner)` and `useMarketById` for public price

- useCumulativePnl — `app/src/hooks/useCumulativePnl.ts`
    - Used by: `app/src/pages/Profile.tsx`
    - Reads: `config/mockPositions`
    - Build: compute from real positions/prices; enforce privacy rules

- useSponsorMarkets — `app/src/hooks/useSponsorMarkets.ts`
    - Used by: `app/src/pages/ForSponsors.tsx`
    - Reads: wraps `useMockSponsorData` and filters by current sponsor; pairs with `useMockTrades`
    - Build: replace with backend/Anchor-backed sponsor data and real trade/event streams

- useUserPositions — `app/src/hooks/useUserPositions.ts`
    - Used by: `app/src/pages/MarketDetails.tsx`, `app/src/pages/Profile.tsx`
    - Reads: localStorage via `config/mockPositions`
    - Build: fetch from backend/indexer; subscribe to on-chain/backend events

- useSponsorMode — `app/src/hooks/useSponsorMode.ts`
    - Used by: `app/src/pages/ForSponsors.tsx`, `app/src/components/SponsorModeOverrideSwitch.tsx`
    - Reads: `SPONSOR_WHITELIST` and `SPONSOR_DEBUG_OVERRIDE` from `config/mockSponsors`
    - Build: backend-provided authorization (JWT/session) and/or on-chain gating; keep override only for dev

- useUserAddress — `app/src/hooks/useUserAddress.ts`
    - Used by: `app/src/pages/Profile.tsx`, and inside `useSponsorMode`
    - Reads: Privy user; not a mock but needs wallet exposure for tx signing
    - Build: expose Solana wallet adapter/provider; gate txs on `ready` (available via `useSolanaKit()`)

- Utility: useCountdown — `app/src/hooks/useCountdown.ts`
    - Used widely; not tied to mocks

New hooks (to replace call sites of mocks) — pending:

- `useMarkets(scope)` → replaces ad hoc mock fetches in `TrendingMarkets.tsx` and list sections of `Sponsors.tsx`
- `useMarketById(id)` → replaces `useMarket` in `MarketDetails.tsx`
- `useSponsors()` → replaces `MOCK_SPONSORS` in `Sponsors.tsx`
- `useTrades(marketId)` → replaces simulated ticking in `TradeFeed`

## Mock data sources — page/component map and redundancies

- Pages
    - Trending: `config/mockSponsorMarkets.getSponsorMarketsFiltered(scope)` → `SponsorMarket[]`
    - Sponsors: `config/mockSponsors.MOCK_SPONSORS.sampleMarkets: Market[]`
    - Market Details: `hooks/useMarket(id)` → synthetic `Market` (from sponsor markets or adapted from `mockMarkets`)
    - For Sponsors: `hooks/useSponsorMarkets` wraps `useMockSponsorData` seeded by `config/mockSponsorMarkets` (derived from `MOCK_SPONSORS`); trades from `hooks/useMockTrades`
    - Profile: `config/mockPositions.getPositions()`; balance/PnL hooks also read `mockPositions`

- Components
    - `MarketPreviewCard` — fed by either `mockMarkets` or `mockSponsors.sampleMarkets`
    - `SponsorMarketDetails`, `SponsorMarketList` — fed by `useMockSponsorData` → `mockSponsorMarkets`
    - `TradeFeed` — fed by `mockTrades` and local interval
    - `PositionCard` — uses helpers in `mockPositions` and indirectly `mockMarkets` for price

- Redundancies
    - Market shapes (4 different):
        1. `MockMarketPreview` (config/mockMarkets)
        2. `Market` (types/market) via `mockSponsors.sampleMarkets`
        3. `SponsorMarket` (config/mockSponsorMarkets) which extends `Market`
        4. Synthetic `Market` from `useMarket(id)`
    - Trades: single mock `Trade` shape, but real chain exposes events; private window should omit price/size for viewers
    - Positions: `mockPositions` depends on `MOCK_MARKETS` for prices → tight coupling

## Unified interfaces (proposed) and hook contracts

Types (under `app/src/types/`):

- MarketSummary
    - id (base58 PDA or backend id), sponsor, company, isPriceHidden, window: "private"|"public"
    - opportunityStartMs, opportunityEndMs, resultsEndMs?, nextOpportunityStartMs?, attentionScore?

- MarketDetail extends MarketSummary
    - description?, priceSeries? (present only when public or sponsor), resolution fields (resolved, outcome?)

- SponsorMarketExtra
    - liquidity, resolutionCriteria

- TradeEvent (viewer-safe)
    - id, marketId, tsMs, side?, size?, price?, trader? (conditionally present)

- Position (reuse `types/portfolio.Position`), ensure alignment with backend schema

Hook return contracts:

- `useMarkets(scope)` → `MarketSummary[]` (unifies `mockMarkets` and `sampleMarkets` usages)
- `useMarketById(id)` → `MarketDetail | undefined` (replaces `useMarket`)
- `useSponsorData()` → `{ markets: (MarketSummary & SponsorMarketExtra)[], selected?: MarketDetail, createMarket(), resolveMarket(), switchWindow() }`
- `useTrades(marketId)` → `TradeEvent[]` (viewer stream). Optional `sponsor: true` param includes decrypted fields
- `usePositions(owner)` → `Position[]`
- `usePortfolioBalance()` / `useCumulativePnl()` → compute from `usePositions` + public prices via `useMarketById`
- `useSponsorMode()` → backend/role-based auth rather than static whitelist

Interfaces to deprecate at call sites (keep mocks for tests):

- Prefer `MarketSummary` over `MockMarketPreview` in app code (keep mock file for fixtures/tests)
- Prefer `MarketDetail + SponsorMarketExtra` over `config/mockSponsorMarkets` in app code (keep mock file for fixtures/tests)
- Stop importing synthetic `useMarket`; use `useMarketById`
- Decouple app logic from `mockPositions`/`mockMarkets`; let backend supply both; keep mocks as fixtures

Client/repository façade:

- Introduce a `PythiaClient` used by hooks to unify backend + Anchor calls (not yet implemented). Enables swapping mocks with real services and keeps hook contracts stable.

## Mock retention strategy (do not delete mocks)

- Keep all mock modules (`config/mock*`, synthetic generators) as test fixtures and for local demos.
- Add a client facade with drivers:
    - MockDriver: reads from existing mock files, simulates events
    - ProdDriver: calls backend APIs and on-chain via Anchor
- Switch via environment/feature flag, e.g. `VITE_DATA_SOURCE=mock|prod` (default to `prod`) — not wired yet — or per-route dev toggle.
- Hooks depend only on the facade; they don’t import mock files directly. Tests/storybook use MockDriver to seed deterministic data.
- Replace interval-based `TradeFeed` ticking with event streams in ProdDriver; allow optional simulated ticking in MockDriver only.

## On-chain mapping (UI action → instruction) and references

Program files: `programs/pythia_op/src/*.rs` | Tests: `tests/pythia_op.ts`

- Create market → `init_market` then `init_market_encrypted`
- Initialize user position → `init_user_position`
- Private trade → `trade_private` + `update_user_position_private` (encrypted input)
- Switch to public → `switch_to_public` (reveals pools via `reveal_market_state` callback)
- Public trade → `trade_public`
- Switch back to private → `switch_to_private` (hides pools via `hide_market_state` callback)
- Sponsor private view → `get_sponsor_view` (client decrypt)
- Sponsor user position view → `get_user_position_view`
- Resolve market → `resolve_market`
- Claim payout → Not implemented; add instruction or handle settlement off-chain, then update UI wiring

Events to stream (backend WS or RPC): `TradeEvent`, `WindowSwitchEvent`, `MarketResolvedEvent`

## Backend/API suggestions (for hooks)

- Markets
    - GET `/markets?scope=trending|public|private`
    - GET `/markets/:id`
    - POST `/markets` → perform `init_market` + `init_market_encrypted`
    - POST `/markets/:id/window` `{ action: "public"|"private" }`
    - POST `/markets/:id/resolve` `{ outcome: true|false }`

- Trades
    - POST `/markets/:id/trades/private` (client encrypts payload; service forwards `trade_private`)
    - POST `/markets/:id/trades/public`
    - WS `/events` streaming `TradeEvent`, `WindowSwitchEvent`, `MarketResolvedEvent`

- Positions
    - GET `/positions?owner=<address>`
    - POST `/positions/:id/claim` (if/when chain supports)

## High-impact file edits to start with

- `pages/ForSponsors.tsx` → currently uses `useSponsorMarkets` (mock-backed); replace with real hook; add window switch actions
- `pages/MarketDetails.tsx` → wire Buy YES/NO; replace `useMarket` with `useMarketById`
- `pages/TrendingMarkets.tsx`, `pages/Sponsors.tsx` → replace mock fetches with hooks
- New hooks to add: `hooks/useMarkets.ts`, `hooks/useMarketById.ts`, `hooks/useSponsors.ts`, `hooks/useTrades.ts` (WS-backed)
- Existing interim hooks: `hooks/useSponsorMarkets.ts`, `hooks/useUserPositions.ts`

## Risks / notes

- Private window requires x25519/RescueCipher key handling (see `tests/pythia_op.ts`); sponsor/trader key management must be designed
- Program lacks `claim_payout`; align on-chain design before wiring Profile claims
- Indexing markets by PDA requires backend to maintain lists and denormalized fields (logo, attention, windows)
