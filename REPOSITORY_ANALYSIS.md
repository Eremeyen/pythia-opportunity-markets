# Pythia Opportunity Markets - Repository Analysis

## 📋 Project Overview

**Pythia Opportunity Markets** is a private prediction market platform built on Solana using Anchor (for smart contracts) and Arcium (for Multi-Party Computation/MPC encryption). The platform enables domain experts to provide signals about early-stage opportunities while keeping market prices confidential from everyone except the sponsor.

### Core Concept

The platform implements "Opportunity Markets" inspired by [Paradigm's research](https://www.paradigm.xyz/2025/08/opportunity-markets), designed for:
- **VCs and incubators** to discover high-signal insights about startups
- **Signal providers** to monetize their domain expertise and convictions
- **Private price discovery** where only sponsors can see real-time market activity

### Key Innovation

During a "private window" (opportunity window), all trading happens in an **encrypted dark pool** using Arcium's MPC. Only the market sponsor can view encrypted market state. After the window expires, the market switches to public mode where prices are revealed.

---

## 🏗️ Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Vite + Privy Auth)               │
│  - User interface for traders and sponsors          │
│  - Encrypts/decrypts trades client-side             │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  On-Chain Coordinator (Anchor/Solana)               │
│  - Creates markets, manages window switches         │
│  - Stores encrypted state, handles resolution       │
│  - Public AMM trading during public windows         │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  Confidential Compute Layer (Arcium MPC)            │
│  - Encrypted dark pool orderbook                    │
│  - Private trade execution                          │
│  - Sponsor-only confidential views                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. Smart Contracts (`program/`)

#### Main Program (`programs/pythia_op/src/lib.rs`)
- **Program ID**: `7kcFUfyJaAh5eLJELkrrEWoiNknoY9Yb28f67a314zUs`
- **Framework**: Anchor + Arcium integration
- **Key Instructions**:
  
  **Setup (run once)**:
  - `init_initialize_market_comp_def` - Initialize computation definition
  - `init_process_private_trade_comp_def` - Initialize trade processing
  - `init_reveal_market_state_comp_def` - Initialize state revelation
  - `init_hide_market_state_comp_def` - Initialize state encryption
  - `init_view_market_state_comp_def` - Initialize sponsor views
  - `init_initialize_user_position_comp_def` - Initialize user positions
  - `init_update_user_position_comp_def` - Initialize position updates
  - `init_view_user_position_comp_def` - Initialize position views
  
  **Market Management**:
  - `init_market` - Create new market (sponsor only)
  - `init_market_encrypted` - Initialize encrypted market state
  - `resolve_market` - Resolve market outcome (authority only)
  
  **Trading**:
  - `trade_private` - Submit encrypted trade during private window
  - `trade_public` - Standard AMM trade during public window
  - `init_user_position` - Create user position account
  - `update_user_position_private` - Update encrypted user position
  
  **Window Management**:
  - `switch_to_public` - Reveal state and enable public trading
  - `switch_to_private` - Re-encrypt state and return to dark pool
  
  **Views**:
  - `get_sponsor_view` - Sponsor views encrypted market state
  - `get_user_position_view` - User views their encrypted position

#### State Accounts (`programs/pythia_op/src/state.rs`)

**Market Account**:
```rust
pub struct Market {
    pub sponsor: Pubkey,              // Market creator
    pub authority: Pubkey,             // Resolution authority
    pub question: String,              // Market question (max 200 chars)
    pub resolution_date: i64,          // Unix timestamp
    pub window_state: MarketWindow,    // Private | Public
    pub liquidity_cap: u64,            // Max liquidity
    pub market_state: [[u8; 32]; 4],   // Encrypted: [yes_pool, no_pool, last_price, total_trades]
    pub public_yes_pool: u64,          // Public YES pool
    pub public_no_pool: u64,           // Public NO pool
    pub opp_window_duration: u64,      // Private window duration (seconds)
    pub pub_window_duration: u64,      // Public window duration (seconds)
    pub last_switch_ts: i64,           // Last window switch timestamp
    pub resolved: bool,                // Market resolved?
    pub outcome: Option<bool>,         // Final outcome
}
```

**User Position Account**:
```rust
pub struct UserPosition {
    pub user: Pubkey,
    pub market: Pubkey,
    pub position_state: [[u8; 32]; 2],  // Encrypted: [yes_tokens, no_tokens]
    pub nonce: u128,
}
```

### 2. Encrypted Instructions (`program/encrypted-ixs/src/lib.rs`)

MPC circuits written in Arcium's Arcis language:

- **`initialize_market`** - Create encrypted market state with initial liquidity
- **`initialize_user_position`** - Create encrypted user position (zeros)
- **`process_private_trade`** - Execute encrypted trade, update pools and price
- **`update_user_position`** - Update user's encrypted token balances
- **`reveal_market_state`** - Decrypt market state (4 u64 values)
- **`hide_market_state`** - Encrypt public state back to private
- **`view_market_state`** - Re-encrypt market state for sponsor viewing
- **`view_user_position`** - Re-encrypt user position for viewing

**Trade Processing Logic** (simplified):
```rust
if trade.is_buy_yes {
    state.yes_pool += trade.dollar_amount;
    state.last_price += trade.dollar_amount / 100;
} else {
    state.no_pool += trade.dollar_amount;
    state.last_price -= trade.dollar_amount / 100;
}
state.total_trades += 1;
```

### 3. Frontend (`app/`)

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Authentication**: Privy (wallet abstraction)
- **Routing**: React Router v7
- **State**: Currently minimal (placeholder for future development)

**Key Features to Implement**:
1. Market creation interface (sponsors)
2. Trading interface with encryption (traders)
3. Market browsing and discovery
4. Sponsor dashboard for viewing encrypted state
5. User position viewing

---

## 🚀 How to Deploy

### Prerequisites

1. **Install Dependencies**:
   ```bash
   # Rust toolchain
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   
   # Anchor
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   
   # Arcium CLI
   npm install -g @arcium-hq/cli
   
   # Yarn (for tests)
   npm install -g yarn
   
   # Bun (for frontend)
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Configure Solana Wallet**:
   ```bash
   solana-keygen new --outfile ~/.config/solana/id.json
   
   # For devnet deployment
   solana config set --url devnet
   solana airdrop 2 --url devnet
   ```

### Deployment Steps

#### Step 1: Build the Program

```bash
cd program/
arcium build
```

This compiles:
- The Arcis circuits (encrypted-ixs)
- The Anchor program (programs/pythia_op)

#### Step 2: Deploy to Devnet

```bash
# Deploy with Arcium cluster
# Available cluster offsets: 1078779259, 3726127828, 768109697
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com

# Or use a reliable RPC provider (recommended):
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

**Important**: After deployment, update `CLUSTER_OFFSET` in `tests/pythia_op.ts` to match your cluster offset.

#### Step 3: Initialize Computation Definitions

After deployment, you must initialize all computation definitions (one-time setup):

```typescript
// Uncomment these lines in tests/pythia_op.ts and run once
await initCompDef(program, owner, "initialize_market");
await initCompDef(program, owner, "initialize_user_position");
await initCompDef(program, owner, "process_private_trade");
await initCompDef(program, owner, "update_user_position");
await initCompDef(program, owner, "reveal_market_state");
await initCompDef(program, owner, "hide_market_state");
await initCompDef(program, owner, "view_market_state");
await initCompDef(program, owner, "view_user_position");
```

#### Step 4: Deploy Frontend

```bash
cd ../app/
bun install
bun run build

# Deploy to your hosting provider (Vercel, Netlify, etc.)
# Or run locally:
bun run dev
```

---

## 🧪 How to Test

### Local Testing (with Arcium Localnet)

```bash
cd program/

# Test locally with 2-node MPC cluster
arcium test
```

This:
1. Starts a local Solana validator
2. Spins up 2 Arcium MPC nodes
3. Runs integration tests from `tests/pythia_op.ts`

### Devnet Testing

```bash
# Ensure you have devnet SOL
solana airdrop 2 --url devnet

# Run tests against deployed program
arcium test --skip-local-validator --provider.cluster devnet
```

### Test Coverage

The main test file (`program/tests/pythia_op.ts`) covers:

1. **Setup Phase**:
   - Initialize all computation definitions
   - Obtain MXE public key for encryption

2. **Market Creation**:
   - Create market with question and parameters
   - Initialize encrypted market state with liquidity
   - Verify market account created correctly

3. **Private Trading**:
   - Generate encryption keys
   - Encrypt trade inputs client-side
   - Submit private trades
   - Verify trades execute without revealing prices

4. **User Positions**:
   - Initialize user position accounts
   - Update positions with encrypted trades
   - View encrypted positions

5. **Sponsor Views**:
   - Sponsor requests encrypted market state
   - Decrypt and verify sponsor can see prices
   - Confirm others cannot access

6. **Window Switching**:
   - Wait for opportunity window to expire
   - Switch from private to public
   - Verify state is revealed correctly
   - Public trading works
   - Switch back to private
   - Verify state is encrypted again

7. **Market Resolution**:
   - Resolve market with outcome
   - Test payout claims (not fully implemented)

### Key Test Utilities

**Encryption/Decryption**:
```typescript
import { x25519, RescueCipher } from "@arcium-hq/client";

// Generate keypair
const privateKey = x25519.utils.randomSecretKey();
const publicKey = x25519.getPublicKey(privateKey);

// Encrypt trade
const shared = x25519.getSharedSecret(privateKey, mxePublicKey);
const cipher = new RescueCipher(shared);
const ciphertext = cipher.encrypt([BigInt(amount)], nonce);

// Decrypt result
const plaintext = cipher.decrypt(ciphertext, nonce);
```

**Waiting for MPC Computation**:
```typescript
await awaitComputationFinalization(
  connection,
  computationAddress,
  provider.wallet.publicKey
);
```

---

## 📊 Market Lifecycle Example

```
1. SPONSOR creates market
   └─> initMarket("Will we fund Startup X?", ...)
   └─> initializeMarketState(initial_yes: 25000, initial_no: 25000)
   
2. PRIVATE WINDOW (e.g., 2 weeks)
   ├─> Trader A: tradePrivate(encrypted: $1000 YES)
   ├─> Trader B: tradePrivate(encrypted: $500 NO)
   ├─> Sponsor: getSponsorView() → decrypts to see current price
   └─> Prices hidden from all traders
   
3. WINDOW SWITCH (after opportunity_window_duration)
   └─> Anyone: switchToPublic()
   └─> MPC decrypts state → YES: 26000, NO: 25500
   
4. PUBLIC WINDOW (e.g., 1 week)
   ├─> Trader C: tradePublic(amount: 2000, buy_yes: true)
   ├─> Everyone can see prices update
   └─> Standard constant-product AMM
   
5. OPTIONAL: Switch back to private
   └─> switchToPrivate() → re-encrypts current state
   
6. RESOLUTION (after resolution_date)
   └─> Authority: resolveMarket(outcome: true)
   └─> Winners can claim payouts
```

---

## 🔒 Security & Trust Model

### Threat Model

1. **Sponsor Self-Dealing**: Sponsors could trade against their own markets
   - **Mitigation**: Reputation-based (v0), commit to no self-trading
   
2. **User Deanonymization**: Trades could be linked to users
   - **Mitigation**: Encrypted under shared secret, only MPC + sponsor can decrypt
   
3. **Front-Running**: Price info leaks during window switches
   - **Mitigation**: Atomic callback transactions
   
4. **MPC Node Collusion**: If all nodes collude, they could decrypt everything
   - **Mitigation**: Arcium's decentralized MPC network

### Best Practices for Sponsors

- Never trade in your own markets
- Use trading profits to add liquidity or refund participants
- Share aggregated trade logs post-resolution for transparency
- Build reputation over multiple resolved markets

---

## 🎯 Current Limitations

1. **Fixed Array Sizes**: 
   - Market state: 4 encrypted fields
   - User positions: 2 encrypted fields
   - No dynamic arrays in MPC circuits

2. **Simplified Pricing**: 
   - Basic constant-product AMM
   - No slippage protection
   - No limit orders

3. **Manual Window Switching**: 
   - Requires someone to call `switchToPublic/Private`
   - Could be automated with Clockwork or similar

4. **No Real Tokens**: 
   - Currently just balance tracking
   - No SPL token minting/burning

5. **No Payouts Implementation**: 
   - `claim_payout` is stubbed out
   - Needs SPL token integration

---

## 🚧 Future Enhancements (V2+)

- [ ] Oracle integration for automatic resolution
- [ ] Off-chain pricing dashboards for sponsors
- [ ] ZK proofs of fair sponsor behavior
- [ ] Multi-market MXE sharing (efficiency)
- [ ] SPL token integration for real payouts
- [ ] Order book matching instead of AMM
- [ ] Automated window switching with cron
- [ ] Mobile app with biometric auth
- [ ] Analytics dashboard for signal provider reputation

---

## 📚 Key Technologies

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Solana** | Layer 1 blockchain | [docs.solana.com](https://docs.solana.com) |
| **Anchor** | Smart contract framework | [anchor-lang.com](https://anchor-lang.com) |
| **Arcium** | Multi-Party Computation | [docs.arcium.com](https://docs.arcium.com) |
| **React** | Frontend framework | [react.dev](https://react.dev) |
| **Vite** | Build tool | [vitejs.dev](https://vitejs.dev) |
| **Privy** | Wallet abstraction | [privy.io](https://privy.io) |

---

## 🎓 Development Context

This project was created for:
- **Colosseum's Cypherpunk Hackathon** (Solana ecosystem)
- Inspired by Dave White's [Opportunity Markets paper](https://www.paradigm.xyz/2025/08/opportunity-markets)
- Goal: Enable prediction markets for:
  - Early-stage startup funding decisions
  - Artist/creator signings
  - Research paper impact
  - TikTok trend prediction
  - Any domain with "opportunity windows"

---

## 📝 Configuration Files

### Anchor.toml
- Program ID: `FUMfgwKJpmXPp6oMBf1YkzgJm8QxwmzBh5WeKva8YPxS` (localnet)
- Package manager: `bun`
- Test command: `bunx ts-mocha -p ./tsconfig.json -t 1000000 "tests/**/*.ts"`
- Provider: localnet by default

### Arcium.toml
- Local nodes: 2 (for testing)
- Backend: Cerberus (MPC engine)
- Timeout: 60 seconds

### package.json (program)
- Arcium client: `^0.3.0`
- Anchor: `^0.31.1`
- Testing: Mocha + Chai

---

## 🤝 Contributing

When working on this project:

1. **Smart Contracts**: Edit `program/programs/pythia_op/src/`
2. **MPC Circuits**: Edit `program/encrypted-ixs/src/lib.rs`
3. **Tests**: Edit `program/tests/pythia_op.ts`
4. **Frontend**: Edit `app/src/`

Always rebuild after changes:
```bash
arcium build  # Rebuilds both circuits and program
```

---

## 📞 Support & Resources

- **Arcium Discord**: Ask about MPC issues
- **Solana Discord**: Ask about blockchain issues
- **Anchor Discord**: Ask about framework issues
- **Project Docs**: See `/program/README.md` for detailed API

---

*Last Updated: Based on project state as of repository analysis*

