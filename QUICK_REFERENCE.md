# Quick Reference - Common Commands

## 🏗️ Build Commands

```bash
# Build program and circuits
cd program/ && arcium build

# Build frontend
cd app/ && bun install && bun run build

# Clean build (if issues)
cd program/ && rm -rf target/ .anchor/ && arcium build
```

## 🧪 Test Commands

```bash
# Local test (fastest)
cd program/ && arcium test

# Devnet test
cd program/ && arcium test --skip-local-validator --provider.cluster devnet

# With verbose logging
cd program/ && DEBUG=* arcium test

# Frontend dev server
cd app/ && bun run dev
```

## 🚀 Deployment Commands

```bash
# Deploy to devnet
cd program/
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com

# Check deployment
solana program show 7kcFUfyJaAh5eLJELkrrEWoiNknoY9Yb28f67a314zUs --url devnet
```

## 💰 Wallet Commands

```bash
# Generate new wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Check balance
solana balance --url devnet

# Airdrop SOL
solana airdrop 2 --url devnet

# View wallet address
solana address

# Switch network
solana config set --url devnet     # or mainnet-beta
```

## 🔍 Debugging Commands

```bash
# View transaction
solana confirm <SIGNATURE> --url devnet -v

# View account
solana account <PUBKEY> --url devnet

# Watch logs
solana logs --url devnet

# Check program
solana program show <PROGRAM_ID> --url devnet

# Check cluster status
arcium cluster status --cluster-offset 1078779259
```

## 📦 Package Management

```bash
# Install dependencies (root)
yarn install

# Install dependencies (program)
cd program/ && yarn install

# Install dependencies (frontend)
cd app/ && bun install

# Update dependencies
yarn upgrade-interactive
bun update
```

## 🎯 Market Operations (via TypeScript)

### Create Market

```typescript
const question = "Your question here";
const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("market"), owner.publicKey.toBuffer(), Buffer.from(question)],
  program.programId
);

await program.methods
  .initMarket(
    question,
    new anchor.BN(Date.now()/1000 + 86400*30), // 30 days
    new anchor.BN(100000),  // liquidity cap
    new anchor.BN(86400*14), // 2 week private window
    new anchor.BN(86400*7)   // 1 week public window
  )
  .accountsPartial({ sponsor: owner.publicKey, market: marketPda })
  .rpc();
```

### Trade Private

```typescript
const privateKey = x25519.utils.randomSecretKey();
const publicKey = x25519.getPublicKey(privateKey);
const shared = x25519.getSharedSecret(privateKey, mxePublicKey);
const cipher = new RescueCipher(shared);

const tradeAmount = 1000;
const ciphertext = cipher.encrypt([BigInt(tradeAmount)], nonce);

await program.methods
  .tradePrivate(
    new anchor.BN(computationOffset),
    Array.from(ciphertext[0]),
    Array.from(publicKey),
    new anchor.BN(nonce)
  )
  .accountsPartial({ market: marketPda, payer: trader.publicKey })
  .rpc();
```

### Switch to Public

```typescript
await program.methods
  .switchToPublic(new anchor.BN(computationOffset))
  .accountsPartial({ market: marketPda, payer: owner.publicKey })
  .rpc();

// Wait for computation
await awaitComputationFinalization(connection, computationAddress, owner.publicKey);
```

### Get Sponsor View

```typescript
const privateKey = x25519.utils.randomSecretKey();
const publicKey = x25519.getPublicKey(privateKey);

await program.methods
  .getSponsorView(new anchor.BN(computationOffset), Array.from(publicKey))
  .accountsPartial({ market: marketPda, sponsor: sponsor.publicKey })
  .rpc();

// Listen for event
const event = await awaitEvent("sponsorViewMarketEvent");
const cipher = new RescueCipher(x25519.getSharedSecret(privateKey, mxePublicKey));
const [yesPool, noPool, lastPrice, totalTrades] = cipher.decrypt(
  event.encryptedState.map(ct => deserializeLE(ct)),
  event.nonce
);
```

## 📊 Useful Queries

### Get Market Info

```typescript
const market = await program.account.market.fetch(marketPda);
console.log("Question:", market.question);
console.log("Window:", market.windowState);
console.log("Resolved:", market.resolved);
if (market.windowState === "Public") {
  console.log("YES Pool:", market.publicYesPool.toString());
  console.log("NO Pool:", market.publicNoPool.toString());
}
```

### Get User Position

```typescript
const [userPositionPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("user_position"), marketPda.toBuffer(), user.publicKey.toBuffer()],
  program.programId
);

const userPosition = await program.account.userPosition.fetch(userPositionPda);
console.log("User:", userPosition.user.toString());
console.log("Market:", userPosition.market.toString());
// Position is encrypted, need to view via get_user_position_view
```

### List All Markets

```typescript
const markets = await program.account.market.all();
markets.forEach(m => {
  console.log("Market:", m.publicKey.toString());
  console.log("Question:", m.account.question);
  console.log("Sponsor:", m.account.sponsor.toString());
  console.log("Window:", m.account.windowState);
  console.log("---");
});
```

## 🔧 Troubleshooting

### Fix "Account not found"

```bash
# Check if account exists
solana account <PUBKEY> --url devnet

# If not, might need to create it first (e.g., market, user position)
```

### Fix "Insufficient funds"

```bash
solana airdrop 5 --url devnet
sleep 30
solana balance --url devnet
```

### Fix "Transaction too large"

```typescript
// Use compute units
const tx = await program.methods.yourMethod()
  .preInstructions([
    anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
  ])
  .rpc();
```

### Fix "Timeout"

```typescript
// Increase timeout
const connection = new anchor.web3.Connection(rpcUrl, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 120000, // 2 min
});
```

## 📁 Important Paths

```bash
# Program files
program/programs/pythia_op/src/lib.rs           # Main program
program/programs/pythia_op/src/state.rs         # Account structures
program/encrypted-ixs/src/lib.rs                # MPC circuits
program/tests/pythia_op.ts                      # Integration tests

# Config files
program/Anchor.toml                             # Anchor config
program/Arcium.toml                             # Arcium config
program/package.json                            # Dependencies

# Frontend files
app/src/App.tsx                                 # Main React app
app/src/layouts/RootLayout.tsx                  # Layout component
app/package.json                                # Frontend dependencies

# Generated files
program/target/                                 # Build artifacts
program/target/types/pythia_op.ts              # TypeScript types
program/target/idl/pythia_op.json              # Program IDL
```

## 🎯 PDAs (Program Derived Addresses)

```typescript
// Market PDA
const [marketPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("market"), sponsor.toBuffer(), Buffer.from(question)],
  program.programId
);

// User Position PDA
const [userPositionPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("user_position"), market.toBuffer(), user.toBuffer()],
  program.programId
);

// Sign PDA (for Arcium)
const [signPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("arcium_sign")],
  program.programId
);
```

## 🔑 Important Constants

```typescript
// Program ID
const PROGRAM_ID = "7kcFUfyJaAh5eLJELkrrEWoiNknoY9Yb28f67a314zUs";

// Cluster Offset (change to your deployed cluster)
const CLUSTER_OFFSET = 1078779259;

// Time constants
const ONE_DAY = 86400;
const ONE_WEEK = 604800;
const TWO_WEEKS = 1209600;

// Computation definition names
const COMP_DEFS = [
  "initialize_market",
  "initialize_user_position",
  "process_private_trade",
  "update_user_position",
  "reveal_market_state",
  "hide_market_state",
  "view_market_state",
  "view_user_position",
];
```

## 📈 Gas Cost Estimates (Devnet)

| Operation | Cost (SOL) | Notes |
|-----------|------------|-------|
| Create Market | ~0.01 | Rent + tx fee |
| Initialize Encrypted State | ~0.02 | MPC computation fee |
| Private Trade | ~0.01 | MPC computation fee |
| Public Trade | ~0.0001 | Just tx fee |
| Switch Window | ~0.02 | MPC decryption fee |
| Sponsor View | ~0.015 | MPC re-encryption fee |
| Resolve Market | ~0.0001 | Just tx fee |

## 🎨 Frontend Dev Server

```bash
# Development
cd app/
bun run dev       # http://localhost:5173

# Build
bun run build

# Preview build
bun run preview

# Lint
bun run lint

# Format
bun run format
```

## 🔄 Version Info

Check versions:
```bash
rustc --version        # Should be 1.75+
solana --version       # Should be 1.18+
anchor --version       # Should be 0.30+
arcium --version       # Should be 0.3+
bun --version          # Should be 1.0+
node --version         # Should be 18+
```

## 🆘 Emergency Commands

```bash
# If Solana validator stuck
solana-test-validator --reset

# If localnet ports busy
lsof -ti:8899 | xargs kill -9
lsof -ti:8900 | xargs kill -9

# If build cache corrupted
cd program/
rm -rf target/ .anchor/ node_modules/
yarn install
arcium build

# If frontend issues
cd app/
rm -rf node_modules/ bun.lockb dist/
bun install
bun run dev
```

---

## 📚 Additional Resources

- **Full Analysis**: See `REPOSITORY_ANALYSIS.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Program Docs**: See `program/README.md`
- **Arcium Docs**: https://docs.arcium.com
- **Anchor Docs**: https://anchor-lang.com
- **Solana Docs**: https://docs.solana.com

---

*Keep this file handy for quick copy-paste during development!*

