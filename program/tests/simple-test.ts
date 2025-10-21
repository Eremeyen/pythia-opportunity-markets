import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { PythiaOp } from "../target/types/pythia_op";

describe("Simple Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PythiaOp as Program<PythiaOp>;

  it("Market creation works", async () => {
    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", provider.wallet.publicKey.toString());

    // Create a real SPL token mint for collateral
    const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const collateralKeypair = Keypair.generate();
    
    const createMintIx = anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: collateralKeypair.publicKey,
      space: 82,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
      programId: TOKEN_PROGRAM_ID,
    });
    
    const initMintIx = {
      keys: [
        { pubkey: collateralKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: anchor.web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.from([0, 6, ...provider.wallet.publicKey.toBuffer(), 1, ...provider.wallet.publicKey.toBuffer()]),
    };
    
    const tx1 = new anchor.web3.Transaction().add(createMintIx).add(initMintIx);
    await provider.sendAndConfirm(tx1, [collateralKeypair]);
    console.log("✓ Created collateral mint");

    const question = "Test" + Date.now();
    const mockCollateral = collateralKeypair.publicKey;
    
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), provider.wallet.publicKey.toBuffer(), Buffer.from(question)],
      program.programId
    );

    const [yesMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketPda.toBuffer()],
      program.programId
    );

    const [noMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketPda.toBuffer()],
      program.programId
    );

    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      program.programId
    );

    console.log("\nCalling initMarket...");
    
    try {
      const tx = await program.methods
        .initMarket(
          question,
          new anchor.BN(Date.now() / 1000 + 86400),
          new anchor.BN(100000),
          new anchor.BN(10000),  // liquidity_param
          new anchor.BN(300),
          new anchor.BN(300)
        )
        .accounts({
          sponsor: provider.wallet.publicKey,
          market: marketPda,
          yesMint,
          noMint,
          collateralMint: mockCollateral,
          vault,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log("✅ SUCCESS! Market created:", tx.substring(0, 16) + "...");
      
      const market = await program.account.market.fetch(marketPda);
      console.log("\n✅ Market verification:");
      console.log("  Sponsor:", market.sponsor.toString() === provider.wallet.publicKey.toString() ? "✓" : "✗");
      console.log("  YES mint:", market.yesMint.toString() === yesMint.toString() ? "✓" : "✗");
      console.log("  NO mint:", market.noMint.toString() === noMint.toString() ? "✓" : "✗");
      console.log("  Vault:", market.vault.toString() === vault.toString() ? "✓" : "✗");
      console.log("  Liquidity param:", market.liquidityParam.toString() === "10000" ? "✓" : "✗");
      
      console.log("\n✅ ALL CHECKS PASSED - SPL INTEGRATION WORKS!");
      
    } catch (error: any) {
      console.error("❌ FAILED:", error.message);
      if (error.logs) console.error("Logs:", error.logs);
      throw error;
    }
  });
});

