import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PythiaOp } from "../target/types/pythia_op";
import { randomBytes } from "crypto";
import {
  awaitComputationFinalization,
  getArciumEnv,
  getClusterAccAddress,
  getCompDefAccOffset,
  getArciumAccountBaseSeed,
  getArciumProgAddress,
  uploadCircuit,
  buildFinalizeCompDefTx,
  RescueCipher,
  deserializeLE,
  serializeLE,
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getCompDefAccAddress,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  x25519,
} from "@arcium-hq/client";
import * as fs from "fs";
import * as os from "os";
import { expect } from "chai";

describe("PythiaOp", () => {
  const CLUSTER_OFFSET = 1078779259;

  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  
  const wallet = anchor.AnchorProvider.env().wallet;
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  
  anchor.setProvider(provider);
  const program = anchor.workspace.PythiaOp as Program<PythiaOp>;

  type Event = anchor.IdlEvents<(typeof program)["idl"]>;
  const awaitEvent = async <E extends keyof Event>(
    eventName: E
  ): Promise<Event[E]> => {
    let listenerId: number;
    const event = await new Promise<Event[E]>((res) => {
      listenerId = program.addEventListener(eventName, (event) => {
        res(event);
      });
    });
    await program.removeEventListener(listenerId);

    return event;
  };

  const clusterAccount = getClusterAccAddress(CLUSTER_OFFSET);

  it("Full market lifecycle test", async () => {
    const owner = readKpJson(`${os.homedir()}/.config/solana/id.json`);

    console.log("Initializing computation definitions...");
    // await initCompDef(program, owner, "initialize_market");
    // await initCompDef(program, owner, "process_private_trade");
    // await initCompDef(program, owner, "reveal_market_state");
    // await initCompDef(program, owner, "hide_market_state");
    // await initCompDef(program, owner, "view_market_state");
    console.log("All computation definitions initialized");

    const mxePublicKey = await getMXEPublicKeyWithRetry(
      provider as anchor.AnchorProvider,
      program.programId
    );
    console.log("MXE x25519 pubkey is", Buffer.from(mxePublicKey).toString("hex"));

    const question = "Will ETH reach $5000 by EOY?";
    const marketSeeds = [
      Buffer.from("market"),
      owner.publicKey.toBuffer(),
      Buffer.from(question),
    ];
    const [marketPDA] = PublicKey.findProgramAddressSync(
      marketSeeds,
      program.programId
    );

    // console.log("Creating market...");
    // const initMarketSig = await program.methods
    //   .initMarket(
    //     question,
    //     new anchor.BN(Date.now() / 1000 + 86400 * 30), // 30 days from now
    //     new anchor.BN(1000000), // liquidity cap
    //     new anchor.BN(300), // 5 min opportunity window
    //     new anchor.BN(300) // 5 min public window
    //   )
    //   .accountsPartial({
    //     sponsor: owner.publicKey,
    //     market: marketPDA,
    //   })
    //   .signers([owner])
    //   .rpc({ commitment: "confirmed" });
    // console.log("Market created:", initMarketSig);

    // Initialize encrypted market state
    console.log("Initializing encrypted market state...");
    const initComputationOffset = new anchor.BN(randomBytes(8), "hex");
    const initMarketEncSig = await program.methods
      .initMarketEncrypted(
        initComputationOffset,
        new anchor.BN(10000), // initial yes pool
        new anchor.BN(10000) // initial no pool
      )
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: getComputationAccAddress(
          program.programId,
          initComputationOffset
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
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Init market encrypted queued:", initMarketEncSig);

    await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      initComputationOffset,
      program.programId,
      "confirmed"
    );
    console.log("Market state initialized");

    // Test private trade
    console.log("\n--- Testing private trade ---");
    const traderPrivateKey = x25519.utils.randomSecretKey();
    const traderPublicKey = x25519.getPublicKey(traderPrivateKey);
    const sharedSecret = x25519.getSharedSecret(traderPrivateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    // Create trade input: trader_id, dollar_amount, is_buy_yes, info_hash
    const traderId = BigInt(12345);
    const dollarAmount = BigInt(1000);
    const isBuyYes = BigInt(1); // true
    const infoHash = Array.from({ length: 32 }, (_, i) => BigInt(i));

    const tradeData = [traderId, dollarAmount, isBuyYes, ...infoHash];
    const tradeNonce = randomBytes(16);
    const tradeCiphertext = cipher.encrypt(tradeData, tradeNonce);

    const tradeEventPromise = awaitEvent("tradeEvent");
    const tradeComputationOffset = new anchor.BN(randomBytes(8), "hex");

    // Convert ciphertext to bytes - RescueCipher returns bigint[]
    const ciphertextBigints = tradeCiphertext as unknown as bigint[];
    const flatCiphertext = new Uint8Array(ciphertextBigints.length * 32);
    ciphertextBigints.forEach((chunk, i) => {
      const chunkBytes = serializeLE(chunk, 32);
      flatCiphertext.set(chunkBytes, i * 32);
    });

    const tradeSig = await program.methods
      .tradePrivate(
        tradeComputationOffset,
        Buffer.from(flatCiphertext),
        Array.from(traderPublicKey),
        new anchor.BN(deserializeLE(tradeNonce).toString())
      )
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: getComputationAccAddress(
          program.programId,
          tradeComputationOffset
        ),
        clusterAccount: clusterAccount,
        mxeAccount: getMXEAccAddress(program.programId),
        mempoolAccount: getMempoolAccAddress(program.programId),
        executingPool: getExecutingPoolAccAddress(program.programId),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("process_private_trade")).readUInt32LE()
        ),
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Private trade queued:", tradeSig);

    await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      tradeComputationOffset,
      program.programId,
      "confirmed"
    );
    const tradeEvent = await tradeEventPromise;
    console.log("Trade processed, window:", tradeEvent.window);

    // Switch to public window
    console.log("\n--- Switching to public window ---");
    // Wait for opportunity window to expire
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const revealEventPromise = awaitEvent("windowSwitchEvent");
    const revealComputationOffset = new anchor.BN(randomBytes(8), "hex");

    const switchPublicSig = await program.methods
      .switchToPublic(revealComputationOffset)
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: getComputationAccAddress(
          program.programId,
          revealComputationOffset
        ),
        clusterAccount: clusterAccount,
        mxeAccount: getMXEAccAddress(program.programId),
        mempoolAccount: getMempoolAccAddress(program.programId),
        executingPool: getExecutingPoolAccAddress(program.programId),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("reveal_market_state")).readUInt32LE()
        ),
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Switch to public queued:", switchPublicSig);

    await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      revealComputationOffset,
      program.programId,
      "confirmed"
    );
    const revealEvent = await revealEventPromise;
    console.log("Switched to public:", revealEvent);
    console.log("Yes pool:", revealEvent.yesPool.toString());
    console.log("No pool:", revealEvent.noPool.toString());

    // Test public trade
    console.log("\n--- Testing public trade ---");
    const publicTradeEventPromise = awaitEvent("tradeEvent");
    const publicTradeSig = await program.methods
      .tradePublic(new anchor.BN(500), true)
      .accounts({
        trader: owner.publicKey,
        market: marketPDA,
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });
    console.log("Public trade executed:", publicTradeSig);
    const publicTradeEvent = await publicTradeEventPromise;
    console.log("Public trade event:", publicTradeEvent.window);

    console.log("\n✅ All tests passed!");
  });

  async function initCompDef(
    program: Program<PythiaOp>,
    owner: anchor.web3.Keypair,
    circuitName: string
  ): Promise<string> {
    const baseSeedCompDefAcc = getArciumAccountBaseSeed(
      "ComputationDefinitionAccount"
    );
    const offset = getCompDefAccOffset(circuitName);

    const compDefPDA = PublicKey.findProgramAddressSync(
      [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
      getArciumProgAddress()
    )[0];

    console.log(`  Initializing ${circuitName} comp def at ${compDefPDA}`);

    // Map circuit name to method name
    const methodName = `init${circuitName
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("")}CompDef`;

    const sig = await (program.methods as any)[methodName]()
      .accounts({
        compDefAccount: compDefPDA,
        payer: owner.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .signers([owner])
      .rpc({
        commitment: "confirmed",
      });

    // Finalize comp def
    const finalizeTx = await buildFinalizeCompDefTx(
      provider as anchor.AnchorProvider,
      Buffer.from(offset).readUInt32LE(),
      program.programId
    );

    const latestBlockhash = await provider.connection.getLatestBlockhash();
    finalizeTx.recentBlockhash = latestBlockhash.blockhash;
    finalizeTx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    finalizeTx.sign(owner);
    await provider.sendAndConfirm(finalizeTx);

    console.log(`  ✓ ${circuitName} initialized`);
    return sig;
  }
});

async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 10,
  retryDelayMs: number = 500
): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return mxePublicKey;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
    }

    if (attempt < maxRetries) {
      console.log(
        `Retrying in ${retryDelayMs}ms... (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(
    `Failed to fetch MXE public key after ${maxRetries} attempts`
  );
}

function readKpJson(path: string): anchor.web3.Keypair {
  const file = fs.readFileSync(path);
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(file.toString()))
  );
}
