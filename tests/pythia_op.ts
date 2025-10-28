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

  // Shared variables for tests
  let owner: anchor.web3.Keypair;
  let mxePublicKey: Uint8Array;
  let marketPDA: PublicKey;
  let question: string;

  before(async () => {
    owner = readKpJson(`${os.homedir()}/.config/solana/id.json`);
    question = "Will ETH reach $5000 by EOY?";
    
    const marketSeeds = [
      Buffer.from("market"),
      owner.publicKey.toBuffer(),
      Buffer.from(question),
    ];
    marketPDA = PublicKey.findProgramAddressSync(
      marketSeeds,
      program.programId
    )[0];
  });

  it("should initialize computation definitions", async () => {
    console.log("Initializing computation definitions...");
    await initCompDef(program, owner, "initialize_market");
    await initCompDef(program, owner, "initialize_user_position");
    await initCompDef(program, owner, "process_private_trade");
    await initCompDef(program, owner, "update_user_position");
    await initCompDef(program, owner, "reveal_market_state");
    await initCompDef(program, owner, "hide_market_state");
    await initCompDef(program, owner, "view_market_state");
    await initCompDef(program, owner, "view_user_position");
    console.log("All computation definitions initialized");
  });

  it("should get MXE public key", async () => {
    mxePublicKey = await getMXEPublicKeyWithRetry(
      provider as anchor.AnchorProvider,
      program.programId
    );
    console.log("MXE x25519 pubkey is", Buffer.from(mxePublicKey).toString("hex"));
  });

  it("should initialize market account", async () => {
    console.log("Initializing market account...");
    const resolutionDate = new anchor.BN(Date.now() / 1000 + 86400 * 30); // 30 days from now
    const liquidityCap = new anchor.BN(1000000); // 1M liquidity cap
    const oppWindowDuration = new anchor.BN(300); // 5 minutes
    const pubWindowDuration = new anchor.BN(600); // 10 minutes

    const initMarketSig = await program.methods
      .initMarket(
        question,
        resolutionDate,
        liquidityCap,
        oppWindowDuration,
        pubWindowDuration
      )
      .accounts({
        sponsor: owner.publicKey,
        // market: marketPDA,
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });
    
    console.log("Market initialized:", initMarketSig);
    
    // Verify the market account was created
    const marketAccount = await program.account.market.fetch(marketPDA);
    console.log("Market account created with question:", marketAccount.question);
  });

  it("should initialize encrypted market state", async () => {
    console.log("Initializing encrypted market state...");
    const initComputationOffset = new anchor.BN(randomBytes(8), "hex");
    const mxeNonce = randomBytes(16);

    console.log("Queueing market state encryption computation...");
    const initMarketEncSig = await program.methods
      .initMarketEncrypted(
        initComputationOffset,
        new anchor.BN(100), // initial yes pool
        new anchor.BN(100), // initial no pool
        new anchor.BN(deserializeLE(mxeNonce).toString())
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

    console.log("Waiting for market state encryption computation finalization...");
    await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      initComputationOffset,
      program.programId,
      "confirmed"
    );
    console.log("Market state encryption finalized");

    // Verify the market state was updated
    const marketAccount = await program.account.market.fetch(marketPDA);
    console.log("Market nonce after encryption:", marketAccount.nonce.toString());
    console.log("Market state encrypted successfully ✓");
  });

  it.skip("should initialize user position", async () => {
    console.log("\n--- Initializing user position ---");
    const initUserPositionOffset = new anchor.BN(randomBytes(8), "hex");
    const userPositionNonce = randomBytes(16);

    const userPositionSeeds = [
      Buffer.from("user_position"),
      marketPDA.toBuffer(),
      owner.publicKey.toBuffer(),
    ];
    const userPositionPDA = PublicKey.findProgramAddressSync(
      userPositionSeeds,
      program.programId
    )[0];

    console.log("Initializing user position for owner:", owner.publicKey.toBase58());
    const initUserPosSig = await program.methods
      .initUserPosition(
        initUserPositionOffset,
        new anchor.BN(deserializeLE(userPositionNonce).toString())
      )
      .accountsPartial({
        user: owner.publicKey,
        market: marketPDA,
        userPosition: userPositionPDA,
        computationAccount: getComputationAccAddress(
          program.programId,
          initUserPositionOffset
        ),
        clusterAccount: clusterAccount,
        mxeAccount: getMXEAccAddress(program.programId),
        mempoolAccount: getMempoolAccAddress(program.programId),
        executingPool: getExecutingPoolAccAddress(program.programId),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("initialize_user_position")).readUInt32LE()
        ),
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("User position init queued:", initUserPosSig);

    await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      initUserPositionOffset,
      program.programId,
      "confirmed"
    );
    console.log("User position initialized successfully ✓");
  });

  it.skip("should process private trade", async () => {
    console.log("\n--- Testing private trade ---");
    const traderPrivateKey = x25519.utils.randomSecretKey();
    const traderPublicKey = x25519.getPublicKey(traderPrivateKey);
    const sharedSecret = x25519.getSharedSecret(traderPrivateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    // Create trade input: dollar_amount (u64) and is_buy_yes (bool as u8: 0 or 1)
    const dollarAmount = BigInt(50); // $50 trade
    const isBuyYes = BigInt(1); // true = buying yes tokens

    const tradeData = [dollarAmount, isBuyYes];
    const tradeNonce = randomBytes(16);
    const tradeCiphertext = cipher.encrypt(tradeData, tradeNonce);

    const tradeEventPromise = awaitEvent("tradeEvent");
    const tradeComputationOffset = new anchor.BN(randomBytes(8), "hex");

    // Convert first ciphertext chunk to 32 bytes
    const ciphertextBigints = tradeCiphertext as unknown as bigint[];
    const firstChunk = serializeLE(ciphertextBigints[0], 32);

    const tradeSig = await program.methods
      .tradePrivate(
        tradeComputationOffset,
        Array.from(firstChunk),
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
  });

  it.skip("should switch to public window", async () => {
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
  });

  it.skip("should execute public trade", async () => {
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
