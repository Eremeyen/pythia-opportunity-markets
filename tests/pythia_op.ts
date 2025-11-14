import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PythiaOp } from "../target/types/pythia_op";
import { randomBytes } from "crypto";
import {
  awaitComputationFinalization,
  buildFinalizeCompDefTx,
  deserializeLE,
  getArciumAccountBaseSeed,
  getArciumProgAddress,
  getClusterAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getComputationAccAddress,
  getExecutingPoolAccAddress,
  getMempoolAccAddress,
  getMXEAccAddress,
  getMXEPublicKey,
  RescueCipher,
  serializeLE,
  x25519,
} from "@arcium-hq/client";
import * as fs from "fs";
import * as os from "os";
import { expect } from "chai";

const CLUSTER_OFFSET = 768109697;

const MARKET_CONFIG = {
  RESOLUTION_DAYS: 30,
  LIQUIDITY_CAP: 1_000_000,
  INITIAL_LIQUIDITY_USDC: 10_000,
  OPP_WINDOW_DURATION_SECONDS: 300,
  PUB_WINDOW_DURATION_SECONDS: 600,
} as const;

const MXE_RETRY_CONFIG = {
  MAX_RETRIES: 10,
  RETRY_DELAY_MS: 500,
} as const;

function readKeypair(path: string): anchor.web3.Keypair {
  const file = fs.readFileSync(path);
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(file.toString()))
  );
}

async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey
): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= MXE_RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return mxePublicKey;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
    }

    if (attempt < MXE_RETRY_CONFIG.MAX_RETRIES) {
      console.log(
        `Retrying in ${MXE_RETRY_CONFIG.RETRY_DELAY_MS}ms... (attempt ${attempt}/${MXE_RETRY_CONFIG.MAX_RETRIES})`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, MXE_RETRY_CONFIG.RETRY_DELAY_MS)
      );
    }
  }

  throw new Error(
    `Failed to fetch MXE public key after ${MXE_RETRY_CONFIG.MAX_RETRIES} attempts`
  );
}

function derivePDA(
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}

function getArciumAccounts(programId: PublicKey) {
  return {
    mxeAccount: getMXEAccAddress(programId),
    mempoolAccount: getMempoolAccAddress(programId),
    executingPool: getExecutingPoolAccAddress(programId),
    clusterAccount: getClusterAccAddress(CLUSTER_OFFSET),
  };
}

function getComputationAccounts(
  programId: PublicKey,
  computationOffset: anchor.BN,
  circuitName: string
) {
  const baseAccounts = getArciumAccounts(programId);
  return {
    ...baseAccounts,
    computationAccount: getComputationAccAddress(programId, computationOffset),
    compDefAccount: getCompDefAccAddress(
      programId,
      Buffer.from(getCompDefAccOffset(circuitName)).readUInt32LE()
    ),
  };
}

function toPascalCase(snakeCase: string): string {
  return snakeCase
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

async function initComputationDefinition(
  program: Program<PythiaOp>,
  provider: anchor.AnchorProvider,
  owner: anchor.web3.Keypair,
  circuitName: string
): Promise<string | null> {
  const baseSeed = getArciumAccountBaseSeed("ComputationDefinitionAccount");
  const offset = getCompDefAccOffset(circuitName);
  const compDefPDA = PublicKey.findProgramAddressSync(
    [baseSeed, program.programId.toBuffer(), offset],
    getArciumProgAddress()
  )[0];

  console.log(`  Initializing ${circuitName} comp def at ${compDefPDA}`);

  try {
    const accountInfo = await provider.connection.getAccountInfo(compDefPDA);
    if (accountInfo && accountInfo.lamports > 0) {
      console.log(`  ⚠ ${circuitName} comp def already exists, assuming finalized`);
      return null;
    }
  } catch (error) {
    // Account doesn't exist, proceed with initialization
  }

  const methodName = `init${toPascalCase(circuitName)}CompDef`;

  try {
    const sig = await (program.methods as any)[methodName]()
      .accounts({
        compDefAccount: compDefPDA,
        payer: owner.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });

    const finalizeTx = await buildFinalizeCompDefTx(
      provider,
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
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log(`  ⚠ ${circuitName} comp def already exists, skipping initialization`);
      return null;
    }
    throw error;
  }
}

async function accountExists<T>(
  fetchFn: () => Promise<T>
): Promise<{ exists: boolean; data?: T }> {
  try {
    const data = await fetchFn();
    return { exists: true, data };
  } catch {
    return { exists: false };
  }
}

describe("PythiaOp", () => {
  const connection = new anchor.web3.Connection(
    "https://devnet.helius-rpc.com/?api-key=a149fae2-6a52-4725-af62-1726c8e2cf9d",
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

  let owner: anchor.web3.Keypair;
  let mxePublicKey: Uint8Array;
  let marketPDA: PublicKey;
  let sponsorPDA: PublicKey;
  let question: string;

  before(async () => {
    owner = readKeypair(`${os.homedir()}/.config/solana/id.json`);
    question = "Will ETH reach $5000 by EOY?";

    sponsorPDA = derivePDA(
      [Buffer.from("sponsor"), owner.publicKey.toBuffer()],
      program.programId
    );

    marketPDA = derivePDA(
      [Buffer.from("market"), sponsorPDA.toBuffer(), Buffer.from(question)],
      program.programId
    );
  });

  it("should initialize computation definitions", async () => {
    console.log("Initializing computation definitions...");
    await initComputationDefinition(program, provider, owner, "initialize_market");
    await initComputationDefinition(program, provider, owner, "initialize_user_position");
    await initComputationDefinition(program, provider, owner, "process_private_trade");
    await initComputationDefinition(program, provider, owner, "update_user_position");
    await initComputationDefinition(program, provider, owner, "close_position");
    await initComputationDefinition(program, provider, owner, "reveal_market_state");
    await initComputationDefinition(program, provider, owner, "hide_market_state");
    await initComputationDefinition(program, provider, owner, "view_market_state");
    await initComputationDefinition(program, provider, owner, "view_user_position");
    console.log("All computation definitions initialized");
  });

  it("should get MXE public key", async () => {
    mxePublicKey = await getMXEPublicKeyWithRetry(provider, program.programId);
    console.log(
      "MXE x25519 pubkey is",
      Buffer.from(mxePublicKey).toString("hex")
    );
  });

  it("should initialize sponsor account", async () => {
    const sponsorName = "Test Sponsor";
    const { exists, data: sponsorAccount } = await accountExists(() =>
      program.account.sponsor.fetch(sponsorPDA)
    );

    if (exists && sponsorAccount) {
      console.log("⚠ Sponsor account already exists, skipping initialization");
      expect(sponsorAccount.name).to.equal(sponsorName);
      return;
    }

    const initSponsorSig = await program.methods
      .initSponsor(sponsorName)
      .accounts({
        authority: owner.publicKey,
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });

    console.log("Sponsor initialized:", initSponsorSig);

    const createdAccount = await program.account.sponsor.fetch(sponsorPDA);
    expect(createdAccount.name).to.equal(sponsorName);
    expect(createdAccount.isWhitelisted).to.be.false;
  });

  it("should whitelist sponsor", async () => {
    const whitelistSig = await program.methods
      .whitelistSponsor()
      .accounts({
        admin: owner.publicKey,
        sponsor: sponsorPDA,
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });

    console.log("Sponsor whitelisted:", whitelistSig);

    const sponsorAccount = await program.account.sponsor.fetch(sponsorPDA);
    expect(sponsorAccount.isWhitelisted).to.be.true;
  });

  it("should initialize market account", async () => {
    const resolutionDate = new anchor.BN(
      Date.now() / 1000 + MARKET_CONFIG.RESOLUTION_DAYS * 86400
    );
    const liquidityCap = new anchor.BN(MARKET_CONFIG.LIQUIDITY_CAP);
    const initialLiquidityUsdc = new anchor.BN(
      MARKET_CONFIG.INITIAL_LIQUIDITY_USDC
    );
    const oppWindowDuration = new anchor.BN(
      MARKET_CONFIG.OPP_WINDOW_DURATION_SECONDS
    );
    const pubWindowDuration = new anchor.BN(
      MARKET_CONFIG.PUB_WINDOW_DURATION_SECONDS
    );

    const { exists, data: marketAccount } = await accountExists(() =>
      program.account.market.fetch(marketPDA)
    );

    if (exists && marketAccount) {
      console.log("⚠ Market account already exists, skipping initialization");
      expect(marketAccount.question).to.equal(question);
      return;
    }

    const initMarketSig = await program.methods
      .initMarket(
        question,
        resolutionDate,
        liquidityCap,
        initialLiquidityUsdc,
        oppWindowDuration,
        pubWindowDuration
      )
      .accounts({
        sponsor: owner.publicKey,
        sponsorAccount: sponsorPDA,
      })
      .signers([owner])
      .rpc({ commitment: "confirmed" });

    console.log("Market initialized:", initMarketSig);

    const createdAccount = await program.account.market.fetch(marketPDA);
    expect(createdAccount.sponsor.toString()).to.equal(sponsorPDA.toString());
    expect(createdAccount.initialLiquidityUsdc.toString()).to.equal(
      initialLiquidityUsdc.toString()
    );
  });

  it("should initialize encrypted market state", async () => {
    const computationOffset = new anchor.BN(randomBytes(8), "hex");
    const mxeNonce = randomBytes(16);
    const initialLiquidityUsdc = new anchor.BN(
      MARKET_CONFIG.INITIAL_LIQUIDITY_USDC
    );

    const accounts = getComputationAccounts(
      program.programId,
      computationOffset,
      "initialize_market"
    );

    for (const [name, account] of Object.entries(accounts)) {
      if (!account || !(account instanceof PublicKey)) {
        throw new Error(`Invalid account ${name}: ${account}`);
      }
    }

    const initMarketEncSig = await program.methods
      .initMarketEncrypted(
        computationOffset,
        initialLiquidityUsdc,
        new anchor.BN(deserializeLE(mxeNonce).toString())
      )
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: accounts.computationAccount,
        clusterAccount: accounts.clusterAccount,
        mxeAccount: accounts.mxeAccount,
        mempoolAccount: accounts.mempoolAccount,
        executingPool: accounts.executingPool,
        compDefAccount: accounts.compDefAccount,
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("Init market encrypted queued:", initMarketEncSig);

    await awaitComputationFinalization(
      provider,
      computationOffset,
      program.programId,
      "confirmed"
    );

    const marketAccount = await program.account.market.fetch(marketPDA);
    console.log("Market nonce after encryption:", marketAccount.nonce.toString());
  });

  it.skip("should initialize user position", async () => {
    const computationOffset = new anchor.BN(randomBytes(8), "hex");
    const userPositionNonce = randomBytes(16);

    const userPositionPDA = derivePDA(
      [
        Buffer.from("user_position"),
        marketPDA.toBuffer(),
        owner.publicKey.toBuffer(),
      ],
      program.programId
    );

    const accounts = getComputationAccounts(
      program.programId,
      computationOffset,
      "initialize_user_position"
    );

    const initUserPosSig = await program.methods
      .initUserPosition(
        computationOffset,
        new anchor.BN(deserializeLE(userPositionNonce).toString())
      )
      .accountsPartial({
        user: owner.publicKey,
        market: marketPDA,
        userPosition: userPositionPDA,
        computationAccount: accounts.computationAccount,
        clusterAccount: accounts.clusterAccount,
        mxeAccount: accounts.mxeAccount,
        mempoolAccount: accounts.mempoolAccount,
        executingPool: accounts.executingPool,
        compDefAccount: accounts.compDefAccount,
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("User position init queued:", initUserPosSig);

    await awaitComputationFinalization(
      provider,
      computationOffset,
      program.programId,
      "confirmed"
    );
  });

  it.skip("should process private trade", async () => {
    const traderPrivateKey = x25519.utils.randomSecretKey();
    const traderPublicKey = x25519.getPublicKey(traderPrivateKey);
    const sharedSecret = x25519.getSharedSecret(traderPrivateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    const dollarAmount = BigInt(50);
    const isBuyYes = BigInt(1);
    const tradeData = [dollarAmount, isBuyYes];
    const tradeNonce = randomBytes(16);
    const tradeCiphertext = cipher.encrypt(tradeData, tradeNonce);

    const tradeEventPromise = awaitEvent("tradeEvent");
    const computationOffset = new anchor.BN(randomBytes(8), "hex");

    const ciphertextBigints = tradeCiphertext as unknown as bigint[];
    const firstChunk = serializeLE(ciphertextBigints[0], 32);

    const accounts = getComputationAccounts(
      program.programId,
      computationOffset,
      "process_private_trade"
    );

    const tradeSig = await program.methods
      .tradePrivate(
        computationOffset,
        Array.from(firstChunk),
        Array.from(traderPublicKey),
        new anchor.BN(deserializeLE(tradeNonce).toString())
      )
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: accounts.computationAccount,
        clusterAccount: accounts.clusterAccount,
        mxeAccount: accounts.mxeAccount,
        mempoolAccount: accounts.mempoolAccount,
        executingPool: accounts.executingPool,
        compDefAccount: accounts.compDefAccount,
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("Private trade queued:", tradeSig);

    await awaitComputationFinalization(
      provider,
      computationOffset,
      program.programId,
      "confirmed"
    );

    const tradeEvent = await tradeEventPromise;
    console.log("Trade processed, window:", tradeEvent.window);
  });

  it.skip("should switch to public window", async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const revealEventPromise = awaitEvent("windowSwitchEvent");
    const computationOffset = new anchor.BN(randomBytes(8), "hex");

    const accounts = getComputationAccounts(
      program.programId,
      computationOffset,
      "reveal_market_state"
    );

    const switchPublicSig = await program.methods
      .switchToPublic(computationOffset)
      .accountsPartial({
        payer: owner.publicKey,
        market: marketPDA,
        computationAccount: accounts.computationAccount,
        clusterAccount: accounts.clusterAccount,
        mxeAccount: accounts.mxeAccount,
        mempoolAccount: accounts.mempoolAccount,
        executingPool: accounts.executingPool,
        compDefAccount: accounts.compDefAccount,
      })
      .signers([owner])
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("Switch to public queued:", switchPublicSig);

    await awaitComputationFinalization(
      provider,
      computationOffset,
      program.programId,
      "confirmed"
    );

    const revealEvent = await revealEventPromise;
    console.log("Switched to public:", revealEvent);
    console.log("Yes pool:", revealEvent.yesPool.toString());
    console.log("No pool:", revealEvent.noPool.toString());
  });

  it.skip("should execute public trade", async () => {
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
  });
});
