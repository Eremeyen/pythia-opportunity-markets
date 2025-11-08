export type Side = 'BUY_YES' | 'BUY_NO';

export type Trade = {
	id: string;
	marketId: string;
	tsMs: number;
	side: Side;
	size: number; // contracts
	price: number; // mock price 0-100
	trader: string; // redacted in viewer mode
};

export const MOCK_TRADES: Record<string, Trade[]> = {};

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function randomBase58(len: number): string {
	let out = '';
	for (let i = 0; i < len; i++) {
		out += BASE58[Math.floor(Math.random() * BASE58.length)];
	}
	return out;
}

export function generateMockTrade(marketId: string): Trade {
	const id = `${marketId}-${Math.random().toString(36).slice(2, 8)}`;
	const prev = MOCK_TRADES[marketId]?.[MOCK_TRADES[marketId].length - 1]?.price ?? 50;
	const delta = (Math.random() - 0.5) * 3.0;
	const price = Math.max(0, Math.min(100, prev + delta));
	const size = Math.floor(1 + Math.random() * 5) * 10;
	const side: Side = Math.random() > 0.5 ? 'BUY_YES' : 'BUY_NO';
	const trader = randomBase58(44);
	return { id, marketId, tsMs: Date.now(), side, size, price, trader };
}
