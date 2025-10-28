import { BorshAccountsCoder, Idl } from '@coral-xyz/anchor';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import pythiaIdl from '../idl/pythia_op.json';

type MarketWindowState = {
  private?: Record<string, never>;
  public?: Record<string, never>;
};

interface MarketAccount {
  window_state: MarketWindowState;
}

const PROGRAM_ID = new PublicKey(
  process.env.PYTHIA_PROGRAM_ID ?? 'CQvzhuYp299gu8rDs4RyLg1cDgnbDZiEdK51NcnSVwGm'
);

const commitment = (process.env.SOLANA_COMMITMENT as Commitment) || 'confirmed';
const connection = new Connection(process.env.SOLANA_RPC_URL || 'http://localhost:8899', {
  commitment,
});

const coder = new BorshAccountsCoder(pythiaIdl as Idl);

export const fetchMarketAccount = async (market: string): Promise<MarketAccount> => {
  const marketPk = new PublicKey(market);
  const info = await connection.getAccountInfo(marketPk, commitment);

  if (!info) {
    throw new Error('Market account not found');
  }

  if (!info.owner.equals(PROGRAM_ID)) {
    throw new Error('Provided account is not owned by the expected program');
  }

  try {
    const decoded = coder.decode<MarketAccount>('market', info.data);
    return decoded;
  } catch (error) {
    console.error('[marketAccess] decode error', error);
    throw new Error('Failed to decode market account');
  }
};

export const ensureMarketIsPublic = async (market: string): Promise<void> => {
  const account = await fetchMarketAccount(market);
  const state = account.window_state;
  const isPrivate = Boolean(state?.private);

  if (isPrivate) {
    throw new Error('Market window is still private');
  }
};
