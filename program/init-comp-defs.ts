// Script to initialize computation definitions on devnet
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PythiaOp } from "./target/types/pythia_op";
import * as fs from "fs";
import * as os from "os";
import {
  getArciumAccountBaseSeed,
  getCompDefAccOffset,
  getMXEAccAddress,
  getArciumProgAddress,
} from "@arcium-hq/client";

// Actual devnet program ID
const DEVNET_PROGRAM_ID = "3u2pYisM2XDqEPDbt6avhpLvBJvoUKHbiYcEYvwfrueN";

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

function readKpJson(path: string): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(path, "utf-8")))
  );
}

async function initCompDef(
  program: Program<PythiaOp>,
  owner: anchor.web3.Keypair,
  compDefName: string
) {
  console.log(`Initializing ${compDefName}...`);
  
  try {
    const baseSeedCompDefAcc = getArciumAccountBaseSeed(
      "ComputationDefinitionAccount"
    );
    const offset = getCompDefAccOffset(compDefName);

    const compDefPDA = PublicKey.findProgramAddressSync(
      [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
      getArciumProgAddress()
    )[0];

    const methodName = `init${compDefName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}CompDef`;

    await (program.methods as any)[methodName]()
      .accounts({
        compDefAccount: compDefPDA,
        payer: owner.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .signers([owner])
      .rpc();

    console.log(`✓ ${compDefName} initialized at ${compDefPDA.toString().substring(0, 8)}...`);
  } catch (error: any) {
    if (error.message?.includes("already in use") || error.logs?.some((log: string) => log.includes("already in use"))) {
      console.log(`✓ ${compDefName} already initialized`);
    } else {
      console.error(`✗ ${compDefName} failed:`, error.message);
      throw error;
    }
  }
}

async function main() {
  // Setup connection
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const owner = readKpJson(`${os.homedir()}/.config/solana/id.json`);
  const wallet = new anchor.Wallet(owner);
  
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  anchor.setProvider(provider);
  
  // Load program with devnet program ID
  const idl = JSON.parse(
    fs.readFileSync("./target/idl/pythia_op.json", "utf-8")
  );
  // Override the program ID in the IDL to use devnet deployment
  idl.address = DEVNET_PROGRAM_ID;
  const program = new anchor.Program(idl, provider) as Program<PythiaOp>;

  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", owner.publicKey.toString());
  console.log("Balance:", (await connection.getBalance(owner.publicKey)) / 1e9, "SOL");
  console.log();

  // Initialize all computation definitions
  for (const compDef of COMP_DEFS) {
    await initCompDef(program, owner, compDef);
  }

  console.log();
  console.log("✅ All computation definitions initialized!");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

