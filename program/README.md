# Opportunity Markets - Pythia

Private prediction markets where only a market's sponsor can see real-time prices, implemented using Arcium (MPC) for confidentiality and Solana (Anchor) for coordination.

## Overview

Opportunity Markets are prediction markets that keep market prices private from everyone but their sponsor. This allows institutions (like record labels, VCs, research labs) to provide liquidity and receive early signals about opportunities without revealing that information to competitors.

### Key Features

- **Private Window**: During the "opportunity window", only the sponsor can see market activity through confidential Arcium views
- **Public Window**: After the opportunity window expires, the market reveals prices and switches to public trading
- **Dark Pool Trading**: Trades during the private window are executed in an encrypted dark pool using MPC
- **Window Switching**: Markets automatically transition between private and public windows
- **Sponsor Views**: Sponsors can query encrypted market state at any time during private windows

## Architecture

### Layers

1. **Confidential Compute (Arcis)**: Maintains private dark-pool orderbook, executes trades, updates hidden balances
2. **On-Chain Coordinator (Anchor)**: Creates markets, stores encrypted state, switches windows, handles resolution
3. **Frontend (Client)**: Generates keypairs, encrypts trades, decrypts results

### Flow

1. Sponsor creates a market → initializes encrypted dark-pool state
2. Traders place encrypted trades during Private Window
3. Sponsor observes market activity through confidential views
4. System switches to Public Window → Arcium decrypts state
5. Traders interact openly until next switch or market resolution
6. At resolution, market confirms outcome and enables payouts

## Project Structure

```
pythia_op/
├── encrypted-ixs/          # Arcis confidential logic
│   └── src/lib.rs          # MPC circuits for dark pool
├── programs/               # Anchor coordination program
│   └── pythia_op/
│       └── src/lib.rs      # On-chain program
├── tests/                  # Integration tests
└── migrations/             # Deployment scripts
```

## Instructions

### Setup Instructions

1. **init_initialize_market_comp_def** - Initialize computation definition for market initialization
2. **init_process_private_trade_comp_def** - Initialize computation definition for private trades
3. **init_reveal_market_state_comp_def** - Initialize computation definition for revealing state
4. **init_hide_market_state_comp_def** - Initialize computation definition for hiding state
5. **init_view_market_state_comp_def** - Initialize computation definition for sponsor views

### Market Management

1. **init_market** - Create a new market PDA
   - Sets up market parameters (question, resolution date, window durations, etc.)
   - Called by sponsor
   
2. **initialize_market_state** - Initialize encrypted dark pool state
   - Queues Arcium computation to create encrypted market state
   - Sets initial YES/NO pool liquidity

### Trading Instructions

1. **trade_private** - Submit encrypted trade during Private window
   - Trader encrypts their trade input
   - MPC executes trade and updates encrypted state
   - No tokens minted; only encrypted ledger changes
   
2. **trade_public** - Standard swap during Public window
   - Simple constant-product AMM
   - Direct on-chain execution

### Window Management

1. **switch_to_public** - Reveal encrypted state and switch to public trading
   - Can only be called after opportunity window expires
   - Decrypts market state via Arcium
   - Makes prices and positions visible
   
2. **switch_to_private** - Re-encrypt state and switch to private trading
   - Can only be called after public window expires
   - Takes current public state and encrypts it
   - Resumes dark pool trading

### Sponsor Views

1. **get_sponsor_view** - Get encrypted view of market state
   - Only callable by sponsor
   - Returns encrypted market state
   - Sponsor decrypts off-chain to view current prices and positions

### Resolution

1. **resolve_market** - Resolve market outcome
   - Called by authority after resolution date
   - Sets final outcome (YES or NO)
   
2. **claim_payout** - Claim payout after resolution
   - Traders redeem winning positions

## Data Types

### Market Account

```rust
pub struct Market {
    pub sponsor: Pubkey,           // Market sponsor
    pub authority: Pubkey,          // Resolution authority
    pub question: String,           // Market question
    pub resolution_date: i64,       // Unix timestamp for resolution
    pub window_state: MarketWindow, // Private | Public
    pub liquidity_cap: u64,         // Max liquidity
    pub private_state_blob: Vec<u8>,// Encrypted market state
    pub public_yes_pool: u64,       // Public YES pool
    pub public_no_pool: u64,        // Public NO pool
    pub opp_window_duration: u64,   // Private window duration (seconds)
    pub pub_window_duration: u64,   // Public window duration (seconds)
    pub last_switch_ts: i64,        // Last window switch timestamp
    pub resolved: bool,             // Market resolved?
    pub outcome: Option<bool>,      // Final outcome
}
```

### Encrypted Types (Arcis)

```rust
pub struct MarketState {
    pub yes_pool: u64,
    pub no_pool: u64,
    pub last_price: u64,
    pub users: [UserBalance; MAX_USERS],
    pub info_hashes: [[u8; 32]; MAX_INFO],
}

pub struct TradeInput {
    pub trader_id: u64,
    pub dollar_amount: u64,
    pub is_buy_yes: bool,
    pub info_hash: [u8; 32],
}
```

## Building and Deployment

### Build

```bash
arcium build
```

This compiles both the Arcis circuits and Anchor program.

### Local Testing

```bash
# Test locally with Arcium localnet
arcium test
```

### Deploy to Devnet

```bash
# Deploy to devnet with Arcium cluster
# Available cluster offsets: 1078779259, 3726127828, 768109697
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com

# Or use a reliable RPC provider (recommended):
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://devnet.helius-rpc.com/?api-key=<YOUR_KEY>
```

**Important**: After deployment, update the `CLUSTER_OFFSET` constant in `tests/pythia_op.ts` to match the cluster offset you used during deployment.

### Testing on Devnet

```bash
# Run tests against deployed program on devnet
arcium test --skip-local-validator --provider.cluster devnet
```

**Prerequisites for devnet testing**:
1. Deploy your program to devnet (see above)
2. Ensure your wallet has devnet SOL: `solana airdrop 2 --url devnet`
3. Update `CLUSTER_OFFSET` in test file to match your deployment
4. Initialize all computation definitions (automatically done by test)

## Usage Example

### 1. Create a Market

```typescript
// Sponsor creates a market
await program.methods
  .initMarket(
    "Will we sign Artist XYZ in 2025?",
    new anchor.BN(resolutionDate),
    new anchor.BN(25000),  // $25k liquidity cap
    new anchor.BN(1209600), // 2 week private window
    new anchor.BN(604800),  // 1 week public window
  )
  .accountsPartial({ sponsor: sponsorKeypair.publicKey })
  .rpc();

// Initialize encrypted state
await program.methods
  .initializeMarketState(
    computationOffset,
    new anchor.BN(25000),  // Initial YES pool
    new anchor.BN(25000),  // Initial NO pool
  )
  .accountsPartial({ market: marketPda })
  .rpc();
```

### 2. Submit Private Trade

```typescript
// Generate keypair and encrypt trade
const privateKey = x25519.utils.randomSecretKey();
const publicKey = x25519.getPublicKey(privateKey);
const shared = x25519.getSharedSecret(privateKey, mxeKey);
const cipher = new RescueCipher(shared);

// Encrypt trade input
const tradeInput = {
  trader_id: traderId,
  dollar_amount: 1000,
  is_buy_yes: true,
  info_hash: hashInfo(someInfo),
};
const ciphertext = cipher.encrypt([BigInt(tradeInput.dollar_amount)], nonce);

await program.methods
  .tradePrivate(
    computationOffset,
    Array.from(ciphertext[0]),
    Array.from(publicKey),
    new anchor.BN(nonce)
  )
  .accountsPartial({ market: marketPda })
  .rpc();
```

### 3. Sponsor Views Market

```typescript
// Only sponsor can call this
await program.methods
  .getSponsorView(
    computationOffset,
    Array.from(sponsorPublicKey)
  )
  .accountsPartial({ 
    market: marketPda,
    sponsor: sponsorKeypair.publicKey 
  })
  .rpc();

// Listen for event and decrypt
// Event contains encrypted market state
```

### 4. Switch Windows

```typescript
// After opportunity window expires
await program.methods
  .switchToPublic(computationOffset)
  .accountsPartial({ market: marketPda })
  .rpc();

// Market state is now public
// Users can see prices and trade openly
```

## Security Considerations

### Trust Model

- **Sponsor Self-Dealing**: Sponsors should commit to not trading in their own markets or using profits for additional liquidity
- **User Deanonymization**: Trades encrypted under Shared key; only MPC nodes + sponsor can decrypt
- **Front-Running**: Window switches happen atomically in callback transactions
- **Verification**: MPC proofs ensure computations match circuits

### Best Practices for Sponsors

1. Never actively sell into your own markets
2. Use trading profits to refund participants or add liquidity
3. Share trade logs post-resolution for transparency
4. Run markets in TEE when possible

## Limitations

- Fixed-size arrays only (MAX_USERS = 256, MAX_INFO = 64)
- No dynamic data structures (Vec, HashMap) in encrypted state
- Simplified AMM pricing (constant-product)
- Window switches require manual triggering (could be automated with cron)

## Future Extensions (V2)

- Oracle-based automatic resolution
- Off-chain pricing simulation dashboards
- Proof of fair sponsor behavior circuits
- Multi-market MXE sharing
- ZK-proof attestations for MPC outputs
- SPL token integration for real token minting/burning
- Order book matching instead of AMM

## License

See LICENSE file.

## Resources

- [Arcium Documentation](https://docs.arcium.com)
- [Opportunity Markets Paper](https://example.com/opportunity-markets)
- [Anchor Documentation](https://anchor-lang.com)
