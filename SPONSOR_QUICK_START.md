# 🚀 Sponsor Quick Start

## TL;DR - How to Sponsor a Market

A sponsor creates prediction markets to gather signals about opportunities without revealing interest.

---

## 📊 6-Step Workflow

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: CREATE MARKET                                  │
│  ─────────────────────────────────────────────────     │
│  You: "Will we fund Startup X?"                         │
│  Set: Resolution date, liquidity cap, windows           │
│  Cost: ~0.01 SOL                                        │
│  Time: < 1 second                                       │
└─────────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────────┐
│  STEP 2: FUND MARKET (Initialize Encrypted State)      │
│  ─────────────────────────────────────────────────     │
│  Provide: $50k YES, $50k NO                             │
│  Result: Initial price = 0.50 (50/50 odds)              │
│  Cost: ~0.02 SOL (MPC fee)                              │
│  Time: ~10 seconds (MPC computation)                    │
└─────────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────────┐
│  STEP 3: PRIVATE WINDOW (2 weeks)                       │
│  ─────────────────────────────────────────────────     │
│  Traders: Submit encrypted trades                       │
│  You: Can view state (encrypted)                        │
│  Public: Cannot see anything                            │
│  Status: PRICES HIDDEN 🔒                               │
└─────────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────────┐
│  STEP 4: VIEW STATE (Anytime during private window)    │
│  ─────────────────────────────────────────────────     │
│  You decrypt and see:                                   │
│    • Current price: 0.73 (strong YES signal!)           │
│    • YES pool: $65k, NO pool: $25k                      │
│    • Total trades: 47                                   │
│  Decision: Strong signal → investigate startup          │
└─────────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────────┐
│  STEP 5: PUBLIC WINDOW (1 week after private ends)     │
│  ─────────────────────────────────────────────────     │
│  Anyone: Calls switchToPublic()                         │
│  Result: State decrypted, prices revealed               │
│  Everyone: Can now see and trade                        │
│  Status: PRICES PUBLIC 🌐                               │
└─────────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────────┐
│  STEP 6: RESOLVE (After 6 months)                       │
│  ─────────────────────────────────────────────────     │
│  You: Did you fund the startup?                         │
│  Resolve: YES (if funded) or NO (if not)                │
│  Result: Winners claim payouts                          │
│  Cost: ~0.0001 SOL                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Total Cost

| Item | Cost | When |
|------|------|------|
| Create Market | 0.01 SOL | Once |
| Fund Market | 0.02 SOL | Once |
| View State | 0.015 SOL | Each time you check |
| Resolve | 0.0001 SOL | Once at end |
| **TOTAL** | **~0.06 SOL** | **≈ $10 USD** |

---

## 🎯 What You Get

### Private Window Benefits
- ✅ **Hidden prices** - Traders can't see each other
- ✅ **No herding** - Independent signals
- ✅ **Sponsor-only view** - You see everything, they don't
- ✅ **Encrypted execution** - MPC keeps it private

### Public Window Benefits
- ✅ **Price discovery** - Market finds true price
- ✅ **More liquidity** - Open trading
- ✅ **Transparency** - Everyone can verify

### Resolution Benefits
- ✅ **Fair payouts** - Winners get paid
- ✅ **Reputation** - Track signal quality
- ✅ **Data** - Historical market data

---

## 🚀 Try It Now

### Option 1: Full Test (Recommended)
```bash
cd program/
./restart-local.sh
```
**See it in action**: Full workflow with real MPC!

### Option 2: Run Example Script
```bash
cd program/
yarn ts-node sponsor-example.ts
```
**Creates a market** with step-by-step output

### Option 3: Read Full Guide
```bash
cat SPONSOR_GUIDE.md
```
**Complete documentation** with all code examples

---

## 💡 Example Markets

### VC Funding Decision
```typescript
Question: "Will Alliance DAO fund CryptoStartup X in Q1 2025?"
Resolution: 90 days
Private Window: 14 days
Public Window: 7 days
Liquidity: $50,000
```

### Artist Signing
```typescript
Question: "Will Universal Music sign Artist Y in 2025?"
Resolution: 365 days
Private Window: 21 days
Public Window: 7 days
Liquidity: $25,000
```

### Research Paper Impact
```typescript
Question: "Will paper Z get 100+ citations within 1 year?"
Resolution: 365 days
Private Window: 30 days
Public Window: 14 days
Liquidity: $10,000
```

---

## 🎨 Code Snippet

**Create your first market** (full example in `sponsor-example.ts`):

```typescript
// 1. Setup
const program = // load program
const wallet = // your wallet

// 2. Define market
const question = "Will we fund Startup X?";
const [marketPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("market"), wallet.publicKey.toBuffer(), Buffer.from(question)],
  program.programId
);

// 3. Create market
await program.methods
  .initMarket(
    question,
    new anchor.BN(Date.now()/1000 + 86400*180), // 6 months
    new anchor.BN(100_000),  // $100k cap
    new anchor.BN(86400*14), // 2 weeks private
    new anchor.BN(86400*7)   // 1 week public
  )
  .accountsPartial({ sponsor: wallet.publicKey, market: marketPda })
  .rpc();

console.log("✅ Market created!", marketPda.toString());
```

---

## 📚 Resources

- 📖 **Full Guide**: `SPONSOR_GUIDE.md`
- 💻 **Code Example**: `program/sponsor-example.ts`
- 🧪 **Test Suite**: `program/tests/pythia_op.ts`
- 🏗️ **Architecture**: `REPOSITORY_ANALYSIS.md`

---

## 🤝 Support

Questions? Check:
1. `SPONSOR_GUIDE.md` - Detailed workflow
2. `DEPLOYMENT_GUIDE.md` - Setup instructions
3. `program/tests/pythia_op.ts` - Working examples

---

**Ready to create your first opportunity market?** 🚀

```bash
./restart-local.sh  # See it work!
```
