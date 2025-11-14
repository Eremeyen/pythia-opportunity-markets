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
  - Current: `getMarketsFiltered(scope)` from `config/mockMarkets` (TODO in file notes to use a hook)
  - Edit: replace with `useMarkets(scope)` backed by backend/indexer; hydrate price, window state, attention
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
  - Current: `useMockSponsorData()` provides markets/trades/create/resolve; viewer path handlers are no-ops
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
  - Current: simulates trades via interval using `generateMockTrade`
  - Edit: subscribe to backend WS stream of `TradeEvent`/`WindowSwitchEvent` or RPC logs; stop local ticking

- `app/src/components/PositionCard.tsx`
  - Current: claim button calls parent `onClaim` which flips mock state
  - Edit: route to backend/chain claim endpoint; hide values during private window

- `app/src/components/PageHeader.tsx`
  - Current: TODO for toast on `!ready`; Privy auth only; no wallet adapter wiring
  - Edit: ensure Solana wallet provider from Privy is accessible for Anchor client

## Hooks — usage map, current mocks, and replacements

Hook usage matrix (where used → what it reads now → what to build):

- useMockSponsorData — `app/src/hooks/useMockSponsorData.ts`
  - Used by: `app/src/pages/ForSponsors.tsx`
  - Reads: `config/mockSponsorMarkets`, `config/mockTrades` (local in-memory)
  - Build: `useSponsorData` backed by backend + Anchor; remove simulated trades

- useMarket — `app/src/hooks/useMarket.ts`
  - Used by: `app/src/pages/MarketDetails.tsx`
  - Reads: synthesizes market from `id` (not from config)
  - Build: `useMarketById(id)` fetching from backend/indexer (PDA or backend id)

- usePortfolioBalance — `app/src/hooks/usePortfolioBalance.ts`
  - Used by: `app/src/pages/Profile.tsx`
  - Reads: `config/mockPositions`; placeholder owed amounts
  - Build: compute from `usePositions(owner)` and `useMarketById` for public price

- useCumulativePnl — `app/src/hooks/useCumulativePnl.ts`
  - Used by: `app/src/pages/Profile.tsx`
  - Reads: `config/mockPositions`
  - Build: compute from real positions/prices; enforce privacy rules

- useSponsorMode — `app/src/hooks/useSponsorMode.ts`
  - Used by: `app/src/pages/ForSponsors.tsx`, `app/src/components/SponsorModeOverrideSwitch.tsx`
  - Reads: `SPONSOR_WHITELIST` and `SPONSOR_DEBUG_OVERRIDE` from `config/mockSponsors`
  - Build: backend-provided authorization (JWT/session) and/or on-chain gating; keep override only for dev

- useUserAddress — `app/src/hooks/useUserAddress.ts`
  - Used by: `app/src/pages/Profile.tsx`, and inside `useSponsorMode`
  - Reads: Privy user; not a mock but needs wallet exposure for tx signing
  - Build: expose Solana wallet adapter/provider; gate txs on `ready`

- Utility: useCountdown — `app/src/hooks/useCountdown.ts`
  - Used widely; not tied to mocks

New hooks (to replace call sites of mocks):

- `useMarkets(scope)` → replaces `getMarketsFiltered` in `TrendingMarkets.tsx` and list sections of `Sponsors.tsx`
- `useSponsors()` → replaces `MOCK_SPONSORS` in `Sponsors.tsx`
- `useSponsorData()` → replaces `useMockSponsorData` in `ForSponsors.tsx`
- `usePositions(owner)` → replaces `getPositions` in `Profile.tsx`
- `useTrades(marketId)` → replaces simulated ticking in `TradeFeed`

## Mock data sources — page/component map and redundancies

- Pages
  - Trending: `config/mockMarkets.getMarketsFiltered(scope)` → `MockMarketPreview[]`
  - Sponsors: `config/mockSponsors.MOCK_SPONSORS.sampleMarkets: Market[]`
  - Market Details: `hooks/useMarket(id)` → synthetic `Market`
  - For Sponsors: `hooks/useMockSponsorData` seeded by `config/mockSponsorMarkets` (derived from `MOCK_SPONSORS`); trades from `config/mockTrades`
  - Profile: `config/mockPositions.getPositions()`; balance/PnL hooks also read `mockPositions`

- Components
  - `MarketPreviewCard` — fed by either `mockMarkets` or `mockSponsors.sampleMarkets`
  - `SponsorMarketDetails`, `SponsorMarketList` — fed by `useMockSponsorData` → `mockSponsorMarkets`
  - `TradeFeed` — fed by `mockTrades` and local interval
  - `PositionCard` — uses helpers in `mockPositions` and indirectly `mockMarkets` for price

- Redundancies
  - Market shapes (4 different):
    1) `MockMarketPreview` (config/mockMarkets)
    2) `Market` (types/market) via `mockSponsors.sampleMarkets`
    3) `SponsorMarket` (config/mockSponsorMarkets) which extends `Market`
    4) Synthetic `Market` from `useMarket(id)`
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

- Introduce a `PythiaClient` used by hooks to unify backend + Anchor calls. Enables swapping mocks with real services and keeps hook contracts stable.

## Mock retention strategy (do not delete mocks)

- Keep all mock modules (`config/mock*`, synthetic generators) as test fixtures and for local demos.
- Add a client facade with drivers:
  - MockDriver: reads from existing mock files, simulates events
  - ProdDriver: calls backend APIs and on-chain via Anchor
- Switch via environment/feature flag, e.g. `VITE_DATA_SOURCE=mock|prod` (default to `prod`), or per-route dev toggle.
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

- `pages/ForSponsors.tsx` → swap `useMockSponsorData` for real hook; add window switch actions
- `pages/MarketDetails.tsx` → wire Buy YES/NO; replace `useMarket` with `useMarketById`
- `pages/TrendingMarkets.tsx`, `pages/Sponsors.tsx` → replace mock fetches with hooks
- New hooks: `hooks/useMarkets.ts`, `hooks/useSponsorData.ts`, `hooks/usePositions.ts`, `hooks/useTrades.ts`

## Risks / notes

- Private window requires x25519/RescueCipher key handling (see `tests/pythia_op.ts`); sponsor/trader key management must be designed
- Program lacks `claim_payout`; align on-chain design before wiring Profile claims
- Indexing markets by PDA requires backend to maintain lists and denormalized fields (logo, attention, windows)


