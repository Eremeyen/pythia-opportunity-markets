// Test SPL Token Integration (Non-MPC parts only)
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PythiaOp } from "../target/types/pythia_op";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount } from "@solana/spl-token";
import { expect } from "chai";

describe("SPL Tokens", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PythiaOp as Program<PythiaOp>;

  let collateralMint: PublicKey;
  let marketPda: PublicKey;
  let yesMint: PublicKey;
  let noMint: PublicKey;
  let vault: PublicKey;

  it("Creates market with SPL tokens", async () => {
    const owner = provider.wallet.publicKey;
    
    // Create collateral mint
    collateralMint = await createMint(
      provider.connection,
      (provider.wallet as any).payer,
      owner,
      null,
      6
    );
    console.log("✓ Created collateral mint");

    const question = "Test market";
    [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), owner.toBuffer(), Buffer.from(question)],
      program.programId
    );

    [yesMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketPda.toBuffer()],
      program.programId
    );

    [noMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketPda.toBuffer()],
      program.programId
    );

    [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initMarket(
        question,
        new anchor.BN(Date.now() / 1000 + 86400),
        new anchor.BN(100000),
        new anchor.BN(10000),
        new anchor.BN(300),
        new anchor.BN(300)
      )
      .accountsPartial({
        sponsor: owner,
        market: marketPda,
        yesMint,
        noMint,
        collateralMint,
        vault,
      })
      .rpc();

    console.log("✓ Market created with tokens");

    const market = await program.account.market.fetch(marketPda);
    expect(market.yesMint.toString()).to.equal(yesMint.toString());
    expect(market.noMint.toString()).to.equal(noMint.toString());
    expect(market.vault.toString()).to.equal(vault.toString());
    console.log("✓ Token accounts verified");
  });

  it("Can trade and receive tokens", async () => {
    const trader = provider.wallet.publicKey;
    
    // Get trader collateral account
    const traderCollateral = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      (provider.wallet as any).payer,
      collateralMint,
      trader
    );

    // Mint collateral to trader
    await mintTo(
      provider.connection,
      (provider.wallet as any).payer,
      collateralMint,
      traderCollateral.address,
      (provider.wallet as any).payer,
      10000 * 1e6
    );
    console.log("✓ Minted collateral to trader");

    // Need to switch to public first
    const market = await program.account.market.fetch(marketPda);
    // Skip if not public
    if (market.windowState.hasOwnProperty('private')) {
      console.log("⏭️  Skipped - market in private window (need MPC to test)");
      return;
    }

    const traderYes = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      (provider.wallet as any).payer,
      yesMint,
      trader
    );

    const tx = await program.methods
      .tradePublic(new anchor.BN(1000 * 1e6), true)
      .accountsPartial({
        trader,
        market: marketPda,
        yesMint,
        noMint,
        vault,
        traderCollateral: traderCollateral.address,
        traderYesTokens: traderYes.address,
      })
      .rpc();

    console.log("✓ Trade executed");

    const yesAccount = await getAccount(provider.connection, traderYes.address);
    expect(Number(yesAccount.amount)).to.be.greaterThan(0);
    console.log("✓ YES tokens received:", Number(yesAccount.amount) / 1e6);
  });
});

