# 🎯 Sponsor Guide - How to Create and Manage Markets

## Overview

As a **sponsor**, you can create prediction markets to gather signals about opportunities (startups, artists, trends) without revealing your interest to competitors.

---

## 🚀 Complete Sponsor Workflow

### Step 1: Create Market

The sponsor creates a market by specifying:
- Question (e.g., "Will we fund Startup X?")
- Resolution date (when to resolve)
- Liquidity cap (max total liquidity)
- Window durations (private and public periods)

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Setup
const connection = new anchor.web3.Connection("https://api.devnet.solana.com");
const wallet = // your wallet
const provider = new anchor.AnchorProvider(connection, wallet, {});
anchor.setProvider(provider);

// Load program
const idl = JSON.parse(fs.readFileSync("./target/idl/pythia_op.json", "utf-8"));
idl.address = "3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN";
const program = new anchor.Program(idl, provider);

// Define market parameters
const question = "Will we fund Startup X within 6 months?";
const resolutionDate = new anchor.BN(Date.now() / 1000 + 86400 * 180); // 6 months
const liquidityCap = new anchor.BN(100_000); // $100,000
const oppWindowDuration = new anchor.BN(86400 * 14); // 2 weeks private
const pubWindowDuration = new anchor.BN(86400 * 7);  // 1 week public

// Calculate market PDA
const [marketPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("market"),
    wallet.publicKey.toBuffer(),
    Buffer.from(question)
  ],
  program.programId
);

// Create the market
const tx = await program.methods
  .initMarket(
    question,
    resolutionDate,
    liquidityCap,
    oppWindowDuration,
    pubWindowDuration
  )
  .accountsPartial({
    sponsor: wallet.publicKey,
    market: marketPda,
  })
  .rpc();

console.log("✅ Market created:", marketPda.toString());
console.log("Transaction:", tx);
```

**What this does**:
- Creates a market account (PDA)
- Sets you as the sponsor
- Sets you as the initial authority (can resolve)
- Starts in **Private** window mode
- Sets initial timestamp for window switching

**Cost**: ~0.01 SOL (rent + fees)

---

### Step 2: Initialize Encrypted State (Fund the Market)

The sponsor provides initial liquidity by initializing the encrypted market state:

```typescript
import { randomBytes } from "crypto";
import {
  getComputationAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getClusterAccAddress,
  awaitComputationFinalization,
} from "@arcium-hq/client";

// Initial liquidity pools
const initialYesPool = new anchor.BN(50_000); // $50k on YES
const initialNoPool = new anchor.BN(50_000);  // $50k on NO

// Generate unique computation ID
const computationOffset = new anchor.BN(randomBytes(8), "hex");

// Cluster info (from deployment)
const CLUSTER_OFFSET = 1078779259;
const clusterAccount = getClusterAccAddress(CLUSTER_OFFSET);

// Initialize encrypted state
const tx = await program.methods
  .initMarketEncrypted(
    computationOffset,
    initialYesPool,
    initialNoPool
  )
  .accountsPartial({
    payer: wallet.publicKey,
    market: marketPda,
    computationAccount: getComputationAccAddress(
      program.programId,
      computationOffset
    ),
    clusterAccount: clusterAccount,
    mxeAccount: getMXEAccAddress(program.programId),
    mempoolAccount: getMempoolAccAddress(program.programId),
    executingPool: getExecutingPoolAccAddress(program.programId),
    compDefAccount: getCompDefAccAddress(
      program.programId,
      Buffer.from(getCompDefAccOffset("initialize_market")).readUInt32LE()
    ),
  })
  .rpc({ skipPreflight: true });

console.log("⏳ Initializing encrypted state...", tx);

// Wait for MPC computation to complete
await awaitComputationFinalization(
  provider,
  computationOffset,
  program.programId,
  "confirmed"
);

console.log("✅ Market state encrypted and initialized");
console.log("   YES pool: $50,000 (encrypted)");
console.log("   NO pool: $50,000 (encrypted)");
console.log("   Initial price: 0.50 (50/50 odds)");
```

**What this does**:
- Queues an MPC computation
- MPC nodes encrypt the initial liquidity
- Stores encrypted state on-chain
- Sets initial price to 50/50 (0.50)

**Cost**: ~0.02 SOL (MPC computation fee)

**Timeline**: ~10-15 seconds for MPC to complete

---

### Step 3: Market is Live (Private Window)

Now traders can submit encrypted trades, but prices remain hidden from everyone except you.

**What happens**:
- ✅ Traders submit encrypted trades
- ✅ MPC executes trades in secret
- ✅ You can view current state (see Step 4)
- ❌ Traders cannot see prices
- ❌ Traders cannot see each other's positions
- ❌ Public cannot see market activity

**Private Window Duration**: 2 weeks (from your setting)

---

### Step 4: View Market State (Sponsor-Only)

During the private window, **only you** can view the current market state:

```typescript
import { x25519, RescueCipher } from "@arcium-hq/client";

// Generate your viewing keypair
const sponsorPrivateKey = x25519.utils.randomSecretKey();
const sponsorPublicKey = x25519.getPublicKey(sponsorPrivateKey);

// Get MXE public key
const mxePublicKey = await getMXEPublicKey(provider, program.programId);

// Request encrypted view
const computationOffset = new anchor.BN(randomBytes(8), "hex");

const tx = await program.methods
  .getSponsorView(
    computationOffset,
    Array.from(sponsorPublicKey)
  )
  .accountsPartial({
    sponsor: wallet.publicKey,
    market: marketPda,
    computationAccount: getComputationAccAddress(
      program.programId,
      computationOffset
    ),
    // ... other accounts
  })
  .rpc();

// Listen for the encrypted response event
const eventPromise = new Promise((resolve) => {
  program.addEventListener("sponsorViewMarketEvent", (event) => {
    resolve(event);
  });
});

const event = await eventPromise;

// Decrypt the state
const sharedSecret = x25519.getSharedSecret(sponsorPrivateKey, mxePublicKey);
const cipher = new RescueCipher(sharedSecret);
const decrypted = cipher.decrypt(event.encryptedState, event.nonce);

console.log("🔓 Decrypted Market State:");
console.log("   YES pool:", decrypted[0].toString());
console.log("   NO pool:", decrypted[1].toString());
console.log("   Last price:", decrypted[2].toString());
console.log("   Total trades:", decrypted[3].toString());

// Calculate current price
const yesPool = Number(decrypted[0]);
const noPool = Number(decrypted[1]);
const price = yesPool / (yesPool + noPool);
console.log("   Current price:", price.toFixed(4));
```

**What this does**:
- Requests encrypted market state from MPC
- MPC re-encrypts state with your public key
- You decrypt client-side to see:
  - Current YES/NO pool sizes
  - Current price
  - Total number of trades

**Key Feature**: Only you can do this! Traders are blind.

**Use Case**: 
- See if there's strong signal (price moved a lot)
- See if there's activity (many trades)
- Decide whether to act on the opportunity

---

### Step 5: Switch to Public Window (Optional)

After the private window expires (2 weeks), anyone can trigger the switch:

```typescript
// Check if window has expired
const market = await program.account.market.fetch(marketPda);
const currentTime = Math.floor(Date.now() / 1000);
const windowExpired = currentTime >= market.lastSwitchTs.toNumber() + market.oppWindowDuration.toNumber();

if (!windowExpired) {
  console.log("⏳ Private window still active");
  console.log("   Time remaining:", (market.oppWindowDuration.toNumber() - (currentTime - market.lastSwitchTs.toNumber())) / 3600, "hours");
} else {
  // Switch to public
  const computationOffset = new anchor.BN(randomBytes(8), "hex");
  
  const tx = await program.methods
    .switchToPublic(computationOffset)
    .accountsPartial({
      payer: wallet.publicKey,
      market: marketPda,
      // ... accounts
    })
    .rpc();
  
  console.log("⏳ Switching to public...", tx);
  
  await awaitComputationFinalization(
    provider,
    computationOffset,
    program.programId,
    "confirmed"
  );
  
  // Market state is now public!
  const updatedMarket = await program.account.market.fetch(marketPda);
  console.log("✅ Market is now PUBLIC");
  console.log("   YES pool:", updatedMarket.publicYesPool.toString());
  console.log("   NO pool:", updatedMarket.publicNoPool.toString());
  console.log("   Price:", updatedMarket.publicLastPrice.toString());
}
```

**What this does**:
- Triggers MPC to decrypt the state
- Reveals current prices and positions
- Switches market to public trading mode
- Everyone can now see and trade

**Timeline**: Takes ~10-15 seconds for MPC decryption

---

### Step 6: Resolve the Market

After the resolution date, you (as authority) resolve the outcome:

```typescript
// Check if resolution date has passed
const market = await program.account.market.fetch(marketPda);
const currentTime = Math.floor(Date.now() / 1000);

if (currentTime < market.resolutionDate.toNumber()) {
  console.log("⏳ Cannot resolve yet");
  console.log("   Time until resolution:", (market.resolutionDate.toNumber() - currentTime) / 86400, "days");
} else {
  // Determine outcome (did you fund the startup? sign the artist?)
  const outcome = true; // YES, you did act on the opportunity
  
  const tx = await program.methods
    .resolveMarket(outcome)
    .accountsPartial({
      authority: wallet.publicKey,
      market: marketPda,
    })
    .rpc();
  
  console.log("✅ Market resolved:", outcome ? "YES" : "NO");
  console.log("Transaction:", tx);
  
  // Winners can now claim payouts
  console.log("📢 Winners can claim their payouts");
}
```

**What this does**:
- Sets the final outcome (YES or NO)
- Marks market as resolved
- Enables payout claims

**Authority**: Only you can do this (set during market creation)

---

## 💰 Cost Summary for Sponsors

| Action | Cost (SOL) | Notes |
|--------|-----------|-------|
| Create Market | ~0.01 | One-time, rent-exempt |
| Initialize State | ~0.02 | MPC computation |
| View State | ~0.015 | Each time you check |
| Switch Windows | ~0.02 | Once per window |
| Resolve Market | ~0.0001 | Final settlement |
| **Total** | **~0.06 SOL** | **≈ $10-15 USD** |

---

## 🎯 Sponsor Benefits

### 1. **Private Price Discovery**
- See market sentiment **before** competitors
- Prices hidden from everyone else
- No herding behavior

### 2. **High-Signal Data**
- Traders put money where their mouth is
- Filter out noise and hype
- Track which traders are accurate over time

### 3. **Reputation Building**
- Build reputation as fair sponsor
- Attract better signal providers
- Create recurring markets

### 4. **Flexible Design**
- Set your own window durations
- Choose liquidity cap
- Control resolution authority

---

## 🛡️ Sponsor Best Practices

### DO:
✅ **Be transparent** - Clearly explain resolution criteria  
✅ **Resolve fairly** - Build long-term reputation  
✅ **Share insights** - Publish aggregated data post-resolution  
✅ **Run multiple markets** - Build track record  
✅ **Set appropriate windows** - Match to decision timeline  

### DON'T:
❌ **Never trade in your own markets** - Undermines trust  
❌ **Don't front-run** - You see prices, don't act before others  
❌ **Don't resolve unfairly** - Reputation is everything  
❌ **Don't leak private info** - Keep trader activity confidential  

---

## 📊 Example Market Scenarios

### Scenario 1: VC Evaluating Startup

```typescript
const question = "Will Alliance DAO fund CryptoStartup X in Q1 2025?";
const resolutionDate = new anchor.BN(Date.now() / 1000 + 86400 * 90); // 90 days
const liquidityCap = new anchor.BN(50_000);
const oppWindow = new anchor.BN(86400 * 14); // 2 weeks private
const pubWindow = new anchor.BN(86400 * 7);  // 1 week public
```

**Workflow**:
1. Create market (Jan 1)
2. Private window: Jan 1-14 (collect signals)
3. View state: Check if strong YES signal
4. Public window: Jan 15-21 (price discovery)
5. Make decision: By Jan 31
6. Resolve: Feb 1 (YES if funded, NO if not)

### Scenario 2: Record Label Discovering Artist

```typescript
const question = "Will Universal Music sign Artist Y in 2025?";
const resolutionDate = new anchor.BN(Date.now() / 1000 + 86400 * 365); // 1 year
const liquidityCap = new anchor.BN(25_000);
const oppWindow = new anchor.BN(86400 * 21); // 3 weeks private
const pubWindow = new anchor.BN(86400 * 7);  // 1 week public
```

**Workflow**:
1. Scouts submit trades (encrypted)
2. Label views state weekly
3. Strong signal? → Reach out to artist
4. After 3 weeks: Public trading
5. After 1 year: Resolve based on contract

---

## 🔧 Helper Functions

### Get Market Info

```typescript
async function getMarketInfo(marketPda: PublicKey) {
  const market = await program.account.market.fetch(marketPda);
  
  console.log("Market Info:");
  console.log("  Question:", market.question);
  console.log("  Sponsor:", market.sponsor.toString());
  console.log("  Window:", market.windowState); // "Private" or "Public"
  console.log("  Resolution Date:", new Date(market.resolutionDate.toNumber() * 1000));
  console.log("  Resolved:", market.resolved);
  if (market.resolved) {
    console.log("  Outcome:", market.outcome ? "YES" : "NO");
  }
  
  return market;
}
```

### Check Window Status

```typescript
async function checkWindowStatus(marketPda: PublicKey) {
  const market = await program.account.market.fetch(marketPda);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (market.windowState === "Private") {
    const timeRemaining = market.lastSwitchTs.toNumber() + market.oppWindowDuration.toNumber() - currentTime;
    console.log("🔒 Private Window");
    console.log("   Time remaining:", (timeRemaining / 3600).toFixed(1), "hours");
    console.log("   Can switch:", timeRemaining <= 0);
  } else {
    const timeRemaining = market.lastSwitchTs.toNumber() + market.pubWindowDuration.toNumber() - currentTime;
    console.log("🌐 Public Window");
    console.log("   Time remaining:", (timeRemaining / 3600).toFixed(1), "hours");
    console.log("   Can switch:", timeRemaining <= 0);
  }
}
```

---

## 🚀 Quick Start Script

Save this as `create-market.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";

async function createMarket() {
  // Setup (replace with your values)
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899"); // or devnet
  const wallet = // your wallet
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);
  
  const idl = JSON.parse(fs.readFileSync("./target/idl/pythia_op.json", "utf-8"));
  const program = new anchor.Program(idl, provider);
  
  // Your market
  const question = "Will we fund Startup X?";
  const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market"), wallet.publicKey.toBuffer(), Buffer.from(question)],
    program.programId
  );
  
  // Create market
  await program.methods
    .initMarket(
      question,
      new anchor.BN(Date.now() / 1000 + 86400 * 30),
      new anchor.BN(100_000),
      new anchor.BN(86400 * 14),
      new anchor.BN(86400 * 7)
    )
    .accountsPartial({ sponsor: wallet.publicKey, market: marketPda })
    .rpc();
  
  console.log("✅ Market created:", marketPda.toString());
  
  // Initialize state (if on localnet with MPC)
  // ... see Step 2 above
}

createMarket().then(() => console.log("Done!"));
```

Run with:
```bash
ts-node create-market.ts
```

---

## 🆘 Troubleshooting

### "Unauthorized" Error
- Make sure you're using the sponsor wallet
- Check that you created the market

### "Window Not Expired" Error  
- Wait for the window duration to pass
- Check `lastSwitchTs + duration` vs current time

### "MXE Not Initialized" Error
- Need to initialize MXE account first
- See DEPLOYMENT_STATUS.md

---

## 📚 Additional Resources

- **Full Example**: See `tests/pythia_op.ts`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Architecture**: See `REPOSITORY_ANALYSIS.md`

---

**Ready to sponsor your first market?** Run `./restart-local.sh` and try it out! 🚀

