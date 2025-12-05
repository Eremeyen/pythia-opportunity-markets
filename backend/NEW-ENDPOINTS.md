# New Backend Endpoints Plan

This document tracks the backend APIs needed to replace the UI mocks called out in `app/INTEGRATION.md`. Each section outlines the goal, data source, request/response shape, and follow-up work for the frontend hooks.

## 1. Trending Markets Inventory

- **Purpose:** power `useMarkets(scope)` / `TrendingMarkets` with real market data instead of `config/mockSponsorMarkets`.
- **Endpoint:** `GET /api/markets`
- **Query params:**
  - `scope`: enum (`24h`, `7d`, `top`) to mirror the existing UI tabs; defaults to `24h`.
  - `status`: optional filter (`public`, `private`, `resolved`) for future reuse.
  - `limit`: optional (default 20, max 100) for pagination/lightweight infinite scroll.
- **Response:** `{ data: MarketSummary[], total?: number, nextCursor?: string }`
  - `MarketSummary` should match the spec in `app/INTEGRATION.md`: `{ id, sponsor, title, window, isPriceHidden, attentionScore, opportunityStartMs, opportunityEndMs, ... }`.
- **Data source:** Mongo (or indexer) collection seeded by the on-chain `init_market` + `init_market_encrypted` events and updated when `switch_to_public/private` fires. Attention/trending metrics are computed off-chain and stored with the record.
- **Frontend follow-up:** implement `useMarkets(scope)` hook that calls this endpoint and pipes results to `TrendingMarkets.tsx` & `MarketPreviewCard`.

## 2. Sponsor Directory

- **Purpose:** replace `MOCK_SPONSORS` and `config/mockSponsorMarkets` for the `Sponsors` page and `useSponsorData`.
- **Endpoint:** `GET /api/sponsors`
- **Query params:** optional `includeMarkets` (boolean, default `true`) to embed each sponsor’s markets; `marketStatus` to restrict to active/public.
- **Response:** `{ sponsors: SponsorSummary[] }`
  - `SponsorSummary`: `{ id, name, logoUrl, description, markets: MarketSummary[] }`.
  - When `includeMarkets=false`, return only sponsor metadata and a `marketCount`.
- **Data source:** same market collection, grouped by `sponsorAuthority` (stored at market creation); sponsor profile metadata can live in a `sponsors` collection managed in the CMS/admin tool.
- **Frontend follow-up:** implement `useSponsors()` hook to hydrate `app/src/pages/Sponsors.tsx` and sponsor carousels. Longer-term, `useSponsorData()` (For Sponsors page) can POST/PUT to create/resolve/update markets under `/api/sponsors/:id/markets`.

## 3. Market Details (read path)

- **Purpose:** replace `useMarket(id)` mock with an API-driven hook.
- **Endpoint:** `GET /api/markets/:marketId`
- **Response:** `{ market: MarketDetail }` where `MarketDetail` extends `MarketSummary` with full description, pricing window data, aggregated price series (when public or viewer has sponsor rights), resolution info, etc.
- **Data source:** same market collection + price history from `/api/price-points` (existing service). Consider embedding recent price points for the detail view to minimize multiple HTTP calls.
- **Frontend follow-up:** build `useMarketById` hook that reads from this endpoint and feeds `MarketDetails.tsx`.

## 4. Future write endpoints (not yet implemented)

- `POST /api/sponsors/:sponsorId/markets`: creates a market by orchestrating `init_market` + `init_market_encrypted`.
- `POST /api/markets/:marketId/resolve`: drives `resolve_market`.
- `POST /api/markets/:marketId/window`: toggles between private/public windows.
- These are referenced in `app/INTEGRATION.md` but require wallet-auth + transaction relaying; keep them on the roadmap once the read endpoints above are stable.

## Implementation Notes

1. **Indexing pipeline:** extend the existing backend worker/indexer to watch the program (via webhooks or RPC logs) and upsert market documents keyed by the market PDA. Persist sponsor address, circuit IDs, window timers, and any trending/attention metrics.
2. **Shared types:** add `MarketSummary` / `MarketDetail` TypeScript interfaces under `backend/src/types` (or reuse from the frontend via a shared package) to keep responses aligned with the hooks.
3. **Auth:** read endpoints can stay public; write endpoints will require sponsor authentication (Privy + wallet signature) before submitting Anchor transactions.
4. **Testing:** add integration tests for each endpoint using the mock Mongo connection to guarantee filters (scope/status) behave identically to the previous mock helpers.

Once these endpoints exist, we can delete the mock data providers and wire the UI through the new hooks without further structural changes.
