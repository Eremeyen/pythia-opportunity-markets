// Complete Sponsor Workflow Example
// Run with: ts-node sponsor-example.ts

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";

// STEP 1: Create a Market
async function sponsorWorkflow() {
  console.log("🎯 SPONSOR WORKFLOW EXAMPLE");
  console.log("===========================\n");

  // Setup connection (use localnet for testing)
  const connection = new anchor.web3.Connection(
    "http://127.0.0.1:8899",
    "confirmed"
  );

  // Load sponsor wallet
  const sponsorKeypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf-8"))
    )
  );

  const wallet = new anchor.Wallet(sponsorKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const idl = JSON.parse(
    fs.readFileSync("./target/idl/pythia_op.json", "utf-8")
  );
  const program = new anchor.Program(idl, provider);

  console.log("📋 STEP 1: CREATE MARKET");
  console.log("========================\n");

  // Define your market
  const question = "Will we fund TechStartup X within 6 months?";
  const resolutionDate = new anchor.BN(
    Math.floor(Date.now() / 1000) + 86400 * 180
  ); // 6 months from now
  const liquidityCap = new anchor.BN(100_000); // $100,000 max
  const oppWindowDuration = new anchor.BN(86400 * 14); // 2 weeks private
  const pubWindowDuration = new anchor.BN(86400 * 7); // 1 week public

  console.log("Market Details:");
  console.log("  Question:", question);
  console.log("  Resolution:", new Date((resolutionDate.toNumber() * 1000)).toDateString());
  console.log("  Liquidity Cap: $100,000");
  console.log("  Private Window: 14 days");
  console.log("  Public Window: 7 days");
  console.log("");

  // Calculate market PDA
  const [marketPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      sponsorKeypair.publicKey.toBuffer(),
      Buffer.from(question),
    ],
    program.programId
  );

  try {
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
        sponsor: sponsorKeypair.publicKey,
        market: marketPda,
      })
      .rpc();

    console.log("✅ Market Created!");
    console.log("  Market Address:", marketPda.toString());
    console.log("  Transaction:", tx);
    console.log("  Status: PRIVATE WINDOW ACTIVE");
    console.log("");

    // Fetch and display market info
    const market = await program.account.market.fetch(marketPda);
    console.log("Market State:");
    console.log("  Sponsor:", market.sponsor.toString());
    console.log("  Authority:", market.authority.toString());
    console.log("  Window Mode:", market.windowState);
    console.log("  Resolved:", market.resolved);
    console.log("");

    console.log("📋 STEP 2: INITIALIZE ENCRYPTED STATE");
    console.log("======================================\n");
    console.log("Next: Run initMarketEncrypted() to fund the market");
    console.log("  - Set initial YES pool: $50,000");
    console.log("  - Set initial NO pool: $50,000");
    console.log("  - Initial price: 0.50 (50/50 odds)");
    console.log("");

    console.log("📋 STEP 3: TRADERS SUBMIT ENCRYPTED TRADES");
    console.log("==========================================\n");
    console.log("Traders can now:");
    console.log("  ✅ Submit encrypted trades");
    console.log("  ✅ Buy YES or NO tokens");
    console.log("  ❌ Cannot see current price (hidden)");
    console.log("  ❌ Cannot see other positions (private)");
    console.log("");

    console.log("📋 STEP 4: SPONSOR VIEWS STATE (SPONSOR-ONLY)");
    console.log("==============================================\n");
    console.log("Only YOU can:");
    console.log("  🔓 View encrypted market state");
    console.log("  📊 See current YES/NO pools");
    console.log("  💰 See current price");
    console.log("  📈 See total trades");
    console.log("");
    console.log("Call getSponsorView() to decrypt and view market activity");
    console.log("");

    console.log("📋 STEP 5: SWITCH TO PUBLIC WINDOW (AFTER 14 DAYS)");
    console.log("==================================================\n");
    console.log("After 2 weeks:");
    console.log("  🌐 Call switchToPublic()");
    console.log("  🔓 State is decrypted");
    console.log("  👁️  Everyone sees prices");
    console.log("  💹 Public trading begins");
    console.log("");

    console.log("📋 STEP 6: RESOLVE MARKET (AFTER 6 MONTHS)");
    console.log("==========================================\n");
    console.log("After resolution date:");
    console.log("  ✅ Call resolveMarket(outcome)");
    console.log("  🏆 Set outcome: YES (funded) or NO (not funded)");
    console.log("  💰 Winners claim payouts");
    console.log("  📊 Update reputation scores");
    console.log("");

    console.log("🎉 WORKFLOW COMPLETE!");
    console.log("====================\n");
    console.log("You've successfully:");
    console.log("  ✅ Created a private prediction market");
    console.log("  ✅ Set yourself as sponsor and authority");
    console.log("  ✅ Configured window durations");
    console.log("  ✅ Enabled private price discovery");
    console.log("");
    console.log("Market Address:", marketPda.toString());
    console.log("");
    console.log("💡 TIP: View full examples in tests/pythia_op.ts");
    console.log("📚 GUIDE: Read SPONSOR_GUIDE.md for detailed instructions");

  } catch (error: any) {
    console.error("❌ Error creating market:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
  }
}

// Run the example
if (require.main === module) {
  sponsorWorkflow()
    .then(() => {
      console.log("\n✅ Example completed successfully!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Error:", err);
      process.exit(1);
    });
}

export { sponsorWorkflow };

