/**
 * Shared Arcium helpers that bridge the Solana Kit stack with Arcium's encrypted workflows.
 *
 * The utilities here:
 * - Derive every PDA we need (Signer, MXE, mempool, executing pool, computation, comp-def, cluster)
 *   without importing `@solana/web3.js`.
 * - Fetch and decode the MXE account (to read the x25519 key + cluster offset) via the Kit RPC.
 * - Generate random offsets/nonces for queued computations.
 * - Encrypt plaintext payloads with Rescue/x25519 to populate instruction arguments.
 */
import { sha256 } from '@noble/hashes/sha256';
import { RescueCipher, x25519, serializeLE, deserializeLE } from '@arcium-hq/client';
import {
	address as toAddress,
	getAddressEncoder,
	getProgramDerivedAddress,
	type Address,
} from '@solana/addresses';
import type { Rpc, SolanaRpcApi } from '@solana/kit';
import type { Commitment } from '@solana/rpc-types';

import { PYTHIA_PROGRAM_ID } from '../config/config';
import { randomBytes } from 'crypto';

const TEXT_ENCODER = new TextEncoder();
const ADDRESS_ENCODER = getAddressEncoder();

const MXE_ACCOUNT_SEED = TEXT_ENCODER.encode('MXEAccount');
const MEMPOOL_SEED = TEXT_ENCODER.encode('Mempool');
const EXEC_POOL_SEED = TEXT_ENCODER.encode('Execpool');
const COMPUTATION_SEED = TEXT_ENCODER.encode('ComputationAccount');
const COMP_DEF_SEED = TEXT_ENCODER.encode('ComputationDefinitionAccount');
const CLUSTER_SEED = TEXT_ENCODER.encode('Cluster');
const SIGNER_PDA_SEED = TEXT_ENCODER.encode('SignerAccount');

const UTILITY_PUBKEY_BYTES = 32 + 32 + 32 + 64;
const ACCOUNT_DISCRIMINATOR_BYTES = 8;

export const SYSTEM_PROGRAM_ADDRESS = '11111111111111111111111111111111' as const;
export const ARCIUM_PROGRAM_ID = 'BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6' as const;
export const ARCIUM_FEE_POOL_ADDRESS = '7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3' as const;
export const ARCIUM_CLOCK_ADDRESS = 'FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65' as const;

export const SYSTEM_PROGRAM = toAddress(SYSTEM_PROGRAM_ADDRESS);
export const ARCIUM_PROGRAM = toAddress(ARCIUM_PROGRAM_ID);
export const ARCIUM_FEE_POOL = toAddress(ARCIUM_FEE_POOL_ADDRESS);
export const ARCIUM_CLOCK = toAddress(ARCIUM_CLOCK_ADDRESS);

const CIRCUIT_OFFSET_CACHE = new Map<ArciumCircuitName, number>();

export type ArciumCircuitName =
	| 'initialize_market'
	| 'initialize_user_position'
	| 'process_private_trade'
	| 'update_user_position'
	| 'close_position'
	| 'reveal_market_state'
	| 'reveal_user_position'
	| 'hide_market_state'
	| 'view_market_state'
	| 'view_user_position';

export type MxeSnapshot = Readonly<{
	programId: Address;
	address: Address;
	clusterOffset: number;
	x25519PublicKey: Uint8Array;
}>;

export type ArciumAccounts = Readonly<{
	signPdaAccount: Address;
	mxeAccount: Address;
	mempoolAccount: Address;
	executingPoolAccount: Address;
	computationAccount: Address;
	compDefAccount: Address;
	clusterAccount: Address;
	feePoolAccount: typeof ARCIUM_FEE_POOL;
	clockAccount: typeof ARCIUM_CLOCK;
	arciumProgram: typeof ARCIUM_PROGRAM;
}>;

export type EncryptedArciumPayload = Readonly<{
	ciphertext: Uint8Array;
	nonce: Uint8Array;
	nonceValue: bigint;
	traderPublicKey: Uint8Array;
	traderSecretKey: Uint8Array;
}>;

export async function deriveSignPda(programId: string = PYTHIA_PROGRAM_ID): Promise<Address> {
	const programAddress = getProgramAddress(programId);
	const [signPda] = await getProgramDerivedAddress({
		programAddress: programAddress,
		seeds: [SIGNER_PDA_SEED],
	});
	return signPda;
}

export async function deriveMxeAccount(programId: string = PYTHIA_PROGRAM_ID): Promise<Address> {
	const programBytes = getProgramBytes(programId);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [MXE_ACCOUNT_SEED, programBytes],
	});
	return account;
}

export async function deriveMempoolAccount(
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const programBytes = getProgramBytes(programId);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [MEMPOOL_SEED, programBytes],
	});
	return account;
}

export async function deriveExecutingPoolAccount(
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const programBytes = getProgramBytes(programId);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [EXEC_POOL_SEED, programBytes],
	});
	return account;
}

export async function deriveComputationAccount(
	computationOffset: bigint,
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const programBytes = getProgramBytes(programId);
	const computationBytes = bigIntToBytesLE(computationOffset, 8);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [COMPUTATION_SEED, programBytes, computationBytes],
	});
	return account;
}

export async function deriveCompDefAccount(
	circuit: ArciumCircuitName,
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const programBytes = getProgramBytes(programId);
	const offsetBytes = numberToBytesLE(getCompDefOffsetNumber(circuit), 4);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [COMP_DEF_SEED, programBytes, offsetBytes],
	});
	return account;
}

export async function deriveClusterAccount(clusterOffset: number): Promise<Address> {
	const clusterBytes = numberToBytesLE(clusterOffset, 4);
	const [account] = await getProgramDerivedAddress({
		programAddress: ARCIUM_PROGRAM,
		seeds: [CLUSTER_SEED, clusterBytes],
	});
	return account;
}

export async function fetchMxeSnapshot(
	rpc: Rpc<SolanaRpcApi>,
	programId: string = PYTHIA_PROGRAM_ID,
	commitment: Commitment = 'confirmed',
): Promise<MxeSnapshot> {
	const programAddress = getProgramAddress(programId);
	const mxeAccount = await deriveMxeAccount(programId);
	const response = await rpc
		.getAccountInfo(mxeAccount, { encoding: 'base64', commitment })
		.send();
	if (!response.value) {
		throw new Error('MXE account is not initialized on-chain.');
	}
	const encoded = response.value.data;
	const base64Data = Array.isArray(encoded) ? encoded[0] : encoded;
	if (typeof base64Data !== 'string') {
		throw new Error('Unexpected MXE account encoding.');
	}
	const rawData = base64ToBytes(base64Data);
	const decoded = decodeMxeAccount(rawData);
	if (decoded.clusterOffset === undefined) {
		throw new Error('MXE cluster offset is unset.');
	}
	if (!decoded.x25519Pubkey) {
		throw new Error('MXE x25519 public key is not published yet.');
	}
	return {
		programId: programAddress,
		address: mxeAccount,
		clusterOffset: decoded.clusterOffset,
		x25519PublicKey: decoded.x25519Pubkey,
	};
}

export async function deriveArciumAccounts(params: {
	computationOffset: bigint;
	circuit: ArciumCircuitName;
	programId?: string;
	snapshot: MxeSnapshot;
}): Promise<ArciumAccounts> {
	const { computationOffset, circuit, snapshot, programId = PYTHIA_PROGRAM_ID } = params;
	const [
		signPdaAccount,
		mempoolAccount,
		executingPoolAccount,
		computationAccount,
		compDefAccount,
		clusterAccount,
	] = await Promise.all([
		deriveSignPda(programId),
		deriveMempoolAccount(programId),
		deriveExecutingPoolAccount(programId),
		deriveComputationAccount(computationOffset, programId),
		deriveCompDefAccount(circuit, programId),
		deriveClusterAccount(snapshot.clusterOffset),
	]);

	return {
		signPdaAccount,
		mxeAccount: snapshot.address,
		mempoolAccount,
		executingPoolAccount,
		computationAccount,
		compDefAccount,
		clusterAccount,
		feePoolAccount: ARCIUM_FEE_POOL,
		clockAccount: ARCIUM_CLOCK,
		arciumProgram: ARCIUM_PROGRAM,
	};
}

/**
 * Needed for initMarketEncrypted. See pythia_op.ts for more details. 
 * @returns A random computation offset
 */
export function generateComputationOffset(): bigint {
	return bytesToBigIntLE(randomBytes(8));
}

export function generateMxeNonce(bytes = 16): { bytes: Uint8Array; value: bigint } {
	if (bytes !== 16) {
		throw new Error('MXE nonces must be 16 bytes.');
	}
	const nonceBytes = randomBytes(bytes);
	return {
		bytes: nonceBytes,
		value: bytesToBigIntLE(nonceBytes),
	};
}

export function encryptArciumPayload(args: {
	plaintext: readonly bigint[];
	mxePublicKey: Uint8Array;
	nonce?: Uint8Array; // PASS THIS AS EMPTY
	traderSecretKey?: Uint8Array;
}): EncryptedArciumPayload {
	const plaintext = args.plaintext.map((value) => BigInt(value));
	const nonce = args.nonce ?? randomBytes(16);
	if (nonce.length !== 16) {
		throw new Error('Arcium ciphertext nonces must be 16 bytes.');
	}
	const traderSecretKey = args.traderSecretKey ?? x25519.utils.randomSecretKey();
	if (traderSecretKey.length !== 32) {
		throw new Error('x25519 secret keys must be 32 bytes.');
	}
	const traderPublicKey = Uint8Array.from(x25519.getPublicKey(traderSecretKey));
	const sharedSecret = x25519.getSharedSecret(traderSecretKey, args.mxePublicKey);
	const cipher = new RescueCipher(sharedSecret);
	const ciphertextChunks = cipher.encrypt(plaintext, nonce);
	if (ciphertextChunks.length === 0) {
		throw new Error('Cipher returned no ciphertext blocks.');
	}
	const ciphertext = Uint8Array.from(ciphertextChunks[0]);
	return {
		ciphertext,
		nonce,
		nonceValue: bytesToBigIntLE(nonce),
		traderPublicKey,
		traderSecretKey: Uint8Array.from(traderSecretKey),
	};
}

// UI CONFIRMATION

export const awaitComputationFinalization = async (computationOffset: bigint) => {
	// TODO: IMPLEMENT THIS
	return null;
}

export function serializeBigint(value: bigint, byteLength: number): Uint8Array {
	return serializeLE(value, byteLength);
}

export function deserializeBigint(bytes: Uint8Array): bigint {
	return deserializeLE(bytes);
}

function decodeMxeAccount(data: Uint8Array): {
	clusterOffset?: number;
	x25519Pubkey?: Uint8Array;
} {
	if (data.length <= ACCOUNT_DISCRIMINATOR_BYTES) {
		throw new Error('MXE account data is malformed.');
	}
	let cursor = ACCOUNT_DISCRIMINATOR_BYTES;
	cursor = skipOption(cursor, data, 32); // authority
	const clusterResult = readOptionU32(cursor, data);
	cursor = clusterResult.cursor;
	if (cursor >= data.length) {
		throw new Error('MXE account truncated before utility pubkeys.');
	}
	const variant = data[cursor];
	cursor += 1;
	if (cursor + UTILITY_PUBKEY_BYTES > data.length) {
		throw new Error('MXE utility pubkeys missing.');
	}
	const x25519Pubkey = data.slice(cursor, cursor + 32);
	cursor += UTILITY_PUBKEY_BYTES;
	let keyReady = variant === 0;
	if (variant === 1) {
		const vec = readBoolVec(cursor, data);
		cursor = vec.cursor;
		keyReady = vec.everyTrue;
	}
	return {
		clusterOffset: clusterResult.value,
		x25519Pubkey: keyReady ? x25519Pubkey : undefined,
	};
}

function skipOption(start: number, buffer: Uint8Array, span: number): number {
	if (start >= buffer.length) {
		throw new Error('Unexpected end of option-encoded field.');
	}
	const flag = buffer[start];
	let cursor = start + 1;
	if (flag === 1) {
		if (cursor + span > buffer.length) {
			throw new Error('Option field extends past account data.');
		}
		cursor += span;
	}
	return cursor;
}

function readOptionU32(start: number, buffer: Uint8Array): { cursor: number; value?: number } {
	if (start >= buffer.length) {
		throw new Error('Unexpected end of U32 option.');
	}
	const flag = buffer[start];
	let cursor = start + 1;
	if (flag === 0) {
		return { cursor, value: undefined };
	}
	if (cursor + 4 > buffer.length) {
		throw new Error('Truncated u32 option payload.');
	}
	const view = new DataView(buffer.buffer, buffer.byteOffset + cursor, 4);
	const value = view.getUint32(0, true);
	cursor += 4;
	return { cursor, value };
}

function readBoolVec(start: number, buffer: Uint8Array): { cursor: number; everyTrue: boolean } {
	if (start + 4 > buffer.length) {
		throw new Error('Boolean vector length is missing.');
	}
	const view = new DataView(buffer.buffer, buffer.byteOffset + start, 4);
	const length = view.getUint32(0, true);
	let cursor = start + 4;
	if (cursor + length > buffer.length) {
		throw new Error('Boolean vector extends past account data.');
	}
	let everyTrue = true;
	for (let i = 0; i < length; i += 1) {
		if (buffer[cursor + i] !== 1) {
			everyTrue = false;
			break;
		}
	}
	cursor += length;
	return { cursor, everyTrue };
}

function getProgramAddress(programId: string): Address {
	return toAddress(programId);
}

function getProgramBytes(programId: string): Uint8Array {
	const address = getProgramAddress(programId);
	return new Uint8Array(ADDRESS_ENCODER.encode(address));
}

function getCompDefOffsetNumber(circuit: ArciumCircuitName): number {
	const cached = CIRCUIT_OFFSET_CACHE.get(circuit);
	if (cached !== undefined) return cached;
	const hash = sha256(TEXT_ENCODER.encode(circuit));
	const view = new DataView(hash.buffer, hash.byteOffset, 4);
	const value = view.getUint32(0, true);
	CIRCUIT_OFFSET_CACHE.set(circuit, value);
	return value;
}

function base64ToBytes(value: string): Uint8Array {
	if (typeof Buffer !== 'undefined') {
		return Uint8Array.from(Buffer.from(value, 'base64'));
	}
	const binary = globalThis.atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function numberToBytesLE(value: number, byteLength: number): Uint8Array {
	if (byteLength !== 4) {
		throw new Error('Unsupported number byte length.');
	}
	const bytes = new Uint8Array(byteLength);
	new DataView(bytes.buffer).setUint32(0, value, true);
	return bytes;
}

function bigIntToBytesLE(value: bigint, byteLength: number): Uint8Array {
	const bytes = new Uint8Array(byteLength);
	const view = new DataView(bytes.buffer);
	if (byteLength === 8) {
		view.setBigUint64(0, value, true);
	} else {
		let temp = value;
		for (let i = 0; i < byteLength; i += 1) {
			bytes[i] = Number(temp & 0xffn);
			temp >>= 8n;
		}
		if (temp !== 0n) {
			throw new Error('Value does not fit in requested byte length.');
		}
	}
	return bytes;
}

function bytesToBigIntLE(bytes: Uint8Array): bigint {
	let result = 0n;
	for (let i = 0; i < bytes.length; i += 1) {
		result |= BigInt(bytes[i]) << (BigInt(i) * 8n);
	}
	return result;
}
