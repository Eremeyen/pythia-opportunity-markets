import {
	address as toAddress,
	getAddressEncoder,
	getProgramDerivedAddress,
	type Address,
} from '@solana/addresses';

import { PYTHIA_PROGRAM_ID } from '../config/config';

const TEXT_ENCODER = new TextEncoder();
const ADDRESS_ENCODER = getAddressEncoder();

const SPONSOR_SEED = TEXT_ENCODER.encode('sponsor');
const MARKET_SEED = TEXT_ENCODER.encode('market');
const USER_POSITION_SEED = TEXT_ENCODER.encode('user_position');

// @TODO: TEST THESE
// ENCODERS MIGHT BE WRONG

export async function deriveSponsorPda(
	authority: string | Address,
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const [pda] = await getProgramDerivedAddress({
		programAddress: programId as Address,
		seeds: [SPONSOR_SEED, ADDRESS_ENCODER.encode(authority as Address)],
	});
	return pda;
}

export async function deriveMarketPda(
	sponsorAccount: string | Address,
	question: string,
	programId: string = PYTHIA_PROGRAM_ID,
): Promise<Address> {
	const [pda] = await getProgramDerivedAddress({
		programAddress: programId as Address,
		seeds: [
			MARKET_SEED,
			ADDRESS_ENCODER.encode(toAddress(sponsorAccount)),
			TEXT_ENCODER.encode(question),
		],
	});
	return pda;
}

export async function deriveUserPositionPda(
	market: string | Address,
	user: string | Address,
	programId: string | Address = PYTHIA_PROGRAM_ID as Address,
): Promise<Address> {
	const [pda] = await getProgramDerivedAddress({
		programAddress: programId as Address,
		seeds: [
			USER_POSITION_SEED,
			ADDRESS_ENCODER.encode(market as Address),
			ADDRESS_ENCODER.encode(user as Address),
		],
	});
	return pda;
}
