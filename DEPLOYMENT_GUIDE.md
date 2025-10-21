# Quick Deployment & Testing Guide

## 🚀 Quick Start - Local Development

```bash
# 1. Install dependencies (one time)
npm install -g @arcium-hq/cli yarn

# 2. Build the program
cd program/
arcium build

# 3. Run local tests
arcium test

# This will:
# - Start local Solana validator
# - Spin up 2 Arcium MPC nodes
# - Run integration tests
# - Shut down automatically
```

---

## 🌐 Devnet Deployment (Step by Step)

### Prerequisites Checklist

- [ ] Solana CLI installed
- [ ] Arcium CLI installed (`npm install -g @arcium-hq/cli`)
- [ ] Wallet with devnet SOL (at least 5 SOL)

```bash
# Check Solana CLI
solana --version

# Check Arcium CLI
arcium --version

# Generate wallet (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Fund wallet
solana config set --url devnet
solana airdrop 2 --url devnet
solana balance
```

### Step 1: Deploy Program

```bash
cd program/

# Deploy to devnet with Arcium cluster
arcium deploy \
  --cluster-offset 1078779259 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com
```

**Expected Output**:
```
✓ Building program...
✓ Uploading circuits...
✓ Deploying program 7kcFUfyJaAh5eLJELkrrEWoiNknoY9Yb28f67a314zUs
✓ Deployment successful!
```

**⚠️ Important**: Note your program ID. Update it in:
- `Anchor.toml` (if different)
- `tests/pythia_op.ts` (CLUSTER_OFFSET constant)

### Step 2: Initialize Computation Definitions (One-Time Setup)

Edit `program/tests/pythia_op.ts` and uncomment lines 67-71:

```typescript
console.log("Initializing computation definitions...");
await initCompDef(program, owner, "initialize_market");
await initCompDef(program, owner, "initialize_user_position");
await initCompDef(program, owner, "process_private_trade");
await initCompDef(program, owner, "update_user_position");
await initCompDef(program, owner, "reveal_market_state");
await initCompDef(program, owner, "hide_market_state");
await initCompDef(program, owner, "view_market_state");
await initCompDef(program, owner, "view_user_position");
```

Run the test to initialize:

```bash
arcium test --skip-local-validator --provider.cluster devnet
```

**Expected**: Test will run, initialize all comp defs, then execute the full test suite.

**After successful init, comment out those lines again** to avoid re-initializing.

### Step 3: Verify Deployment

```bash
# Check program exists
solana program show 7kcFUfyJaAh5eLJELkrrEWoiNknoY9Yb28f67a314zUs --url devnet

# Run tests
arcium test --skip-local-validator --provider.cluster devnet
```

---

## 🧪 Testing Workflows

### Workflow 1: Quick Local Test (During Development)

```bash
cd program/
arcium test
```

**Use when**: Making changes to circuits or program logic

**Time**: ~60 seconds

### Workflow 2: Full Devnet Test

```bash
cd program/
arcium test --skip-local-validator --provider.cluster devnet
```

**Use when**: Testing on real devnet before frontend integration

**Time**: ~120 seconds

**Prerequisites**:
- Program deployed to devnet
- Comp defs initialized
- Wallet has devnet SOL

### Workflow 3: Specific Test Debugging

```bash
cd program/

# Run with verbose logging
DEBUG=* arcium test

# Run specific test file
arcium test tests/specific_test.ts
```

---

## 📋 Common Deployment Issues & Solutions

### Issue 1: "Insufficient funds"

```
Error: Transaction simulation failed: Attempt to debit an account but found no record of a prior credit
```

**Solution**:
```bash
solana airdrop 5 --url devnet
# Wait 30 seconds, then retry
```

### Issue 2: "Cluster not found"

```
Error: Cluster account not found for offset 1078779259
```

**Solutions**:
1. Try a different cluster offset:
   - `1078779259`
   - `3726127828`
   - `768109697`

2. Or deploy a new cluster:
```bash
arcium cluster deploy --nodes 2
# Use the returned offset
```

### Issue 3: "Program already deployed"

```
Error: Program 7kcFU... already exists
```

**Solution**: 
1. Generate new keypair:
```bash
solana-keygen new --outfile ~/.config/solana/deploy-keypair.json
solana airdrop 5 --url devnet --keypair ~/.config/solana/deploy-keypair.json
```

2. Update `Anchor.toml` to use new program ID

3. Re-deploy:
```bash
arcium deploy --keypair-path ~/.config/solana/deploy-keypair.json ...
```

### Issue 4: "Computation definition not initialized"

```
Error: Account does not exist <comp_def_address>
```

**Solution**: Run the initialization step (Step 2 above)

### Issue 5: Test timeout

```
Error: Timeout waiting for computation finalization
```

**Solutions**:
1. Check devnet status: https://status.solana.com
2. Use better RPC: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`
3. Increase timeout in test:
```typescript
await awaitComputationFinalization(connection, computationAddress, wallet, 180000); // 3 min
```

---

## 🎯 Testing Checklist

Before considering deployment "done":

- [ ] All comp defs initialized without errors
- [ ] Can create a market
- [ ] Can initialize encrypted market state
- [ ] Can submit private trades
- [ ] Can initialize user positions
- [ ] Can update user positions
- [ ] Sponsor can view encrypted state
- [ ] User can view encrypted position
- [ ] Can switch to public (after window expires)
- [ ] Public trades work
- [ ] Can switch back to private
- [ ] Can resolve market
- [ ] All events emit correctly

Run this test to verify:
```bash
arcium test --skip-local-validator --provider.cluster devnet
```

---

## 🔍 Debugging Tips

### View Transaction Details

```bash
# Get signature from test output, then:
solana confirm <SIGNATURE> --url devnet -v
```

### Check Account Data

```bash
# View market account
solana account <MARKET_PUBKEY> --url devnet

# View MXE account (for encryption key)
solana account <MXE_PUBKEY> --url devnet
```

### Monitor Real-Time

```bash
# Watch logs
solana logs --url devnet

# In another terminal, run tests
arcium test --skip-local-validator --provider.cluster devnet
```

### Test Encryption/Decryption

```typescript
// Add to test file for debugging
console.log("MXE pubkey:", Buffer.from(mxePublicKey).toString('hex'));
console.log("Private key:", Buffer.from(privateKey).toString('hex'));
console.log("Shared secret:", Buffer.from(sharedSecret).toString('hex'));
console.log("Ciphertext:", ciphertext);
console.log("Plaintext:", plaintext);
```

---

## 📊 Performance Benchmarks

**Local Testing** (M1 Mac):
- Build time: ~30 seconds
- Test suite: ~60 seconds
- Per-test: ~5-10 seconds

**Devnet Testing**:
- Build time: ~30 seconds
- Deployment: ~20 seconds
- Test suite: ~120 seconds
- Per-computation: ~10-15 seconds (MPC execution)

---

## 🔄 Continuous Integration Setup

### GitHub Actions Example

```yaml
name: Test Program

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Arcium CLI
        run: npm install -g @arcium-hq/cli
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Build
        working-directory: ./program
        run: arcium build
      
      - name: Test
        working-directory: ./program
        run: arcium test
```

---

## 🎬 Example: Creating Your First Market

### From TypeScript (in tests)

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PythiaOp } from "../target/types/pythia_op";

// Setup
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.PythiaOp as Program<PythiaOp>;

// 1. Create market
const question = "Will Bitcoin reach $100k by EOY 2025?";
const resolutionDate = new anchor.BN(Date.now() / 1000 + 86400 * 365); // 1 year
const liquidityCap = new anchor.BN(100_000); // $100k
const oppWindow = new anchor.BN(86400 * 14); // 2 weeks
const pubWindow = new anchor.BN(86400 * 7); // 1 week

const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("market"),
    provider.wallet.publicKey.toBuffer(),
    Buffer.from(question),
  ],
  program.programId
);

await program.methods
  .initMarket(question, resolutionDate, liquidityCap, oppWindow, pubWindow)
  .accountsPartial({
    sponsor: provider.wallet.publicKey,
    market: marketPda,
  })
  .rpc();

console.log("Market created:", marketPda.toString());

// 2. Initialize encrypted state
const computationOffset = Date.now(); // Unique ID
await program.methods
  .initMarketEncrypted(
    new anchor.BN(computationOffset),
    new anchor.BN(50_000), // 50k YES
    new anchor.BN(50_000)  // 50k NO
  )
  .accountsPartial({
    market: marketPda,
  })
  .rpc();

console.log("Market initialized with encrypted state");
```

### Expected Devnet Cost

- Create market: ~0.01 SOL (rent + fees)
- Initialize encrypted state: ~0.02 SOL (MPC fees)
- Trade: ~0.01 SOL per trade
- Window switch: ~0.02 SOL (MPC decryption)

**Total for full lifecycle**: ~0.1 SOL

---

## 🎓 Learning Resources

### Understanding MPC
- [Arcium Docs](https://docs.arcium.com)
- [MPC Explainer](https://www.arcium.com/blog/mpc-explained)

### Understanding Anchor
- [Anchor Book](https://book.anchor-lang.com)
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/tests)

### Understanding Solana
- [Solana Cookbook](https://solanacookbook.com)
- [Solana Bootcamp](https://www.soldev.app)

---

## 💡 Pro Tips

1. **Use better RPCs** for devnet:
   - Helius: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`
   - QuickNode: Sign up for free tier
   
2. **Cache builds** to speed up testing:
   ```bash
   # Add to .gitignore
   target/
   .anchor/
   node_modules/
   ```

3. **Keep devnet SOL topped up**:
   ```bash
   # Add to cron or alias
   alias sol-refill='solana airdrop 2 --url devnet && sleep 30 && solana airdrop 2 --url devnet'
   ```

4. **Use fixed cluster offset** during hackathon to avoid redeployment

5. **Monitor Arcium node health**:
   ```bash
   arcium cluster status --cluster-offset 1078779259
   ```

---

## ✅ Pre-Launch Checklist

Before launching on mainnet:

- [ ] All tests pass on devnet (100% success rate over 10 runs)
- [ ] Security audit of smart contracts
- [ ] Frontend tested with real wallet (Phantom, Solflare)
- [ ] Sponsor flows tested end-to-end
- [ ] Trader flows tested end-to-end
- [ ] Window switching tested with real time delays
- [ ] Gas costs estimated and documented
- [ ] Backup RPC endpoints configured
- [ ] Monitoring and alerting set up
- [ ] Documentation reviewed by outsider
- [ ] Legal review of terms of service
- [ ] Bug bounty program launched

---

*For detailed architecture and functionality, see REPOSITORY_ANALYSIS.md*

