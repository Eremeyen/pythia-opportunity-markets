# Price History Backend

Express + MongoDB service that stores price samples coming from the frontend so that a historical chart can be rendered once the market becomes public.

## Setup

1. Duplicate the env template: `cp .env.example .env` and fill in:
   - `MONGO_URI`, `PORT`, optional `ALLOWED_ORIGINS`
   - `SOLANA_RPC_URL` pointing to the cluster where the market lives
   - `PYTHIA_PROGRAM_ID` if you are using a non-default deployment
   - `SOLANA_COMMITMENT` (defaults to `confirmed`)
2. Install dependencies: `yarn --cwd backend install`.
3. Start in watch mode with `yarn --cwd backend dev` or build once via `yarn --cwd backend build && yarn --cwd backend start`.

## API

### POST /api/price-points
Body:
```json
{
  "price": 25.2,
  "market": "<market pubkey>",
  "source": "pythia-ui",
  "timestamp": "2024-06-15T13:37:00Z",
  "metadata": {
    "side": "bid"
  }
}
```

### GET /api/price-points
Query params: `market`, `source`, `from`, `to`, `limit` (default 500, max 5000). The backend fetches the on-chain market account and only returns data when the market window is public. Returns `{ count, data }` ordered by timestamp ascending.

A `/healthz` route is also available for readiness probes.
