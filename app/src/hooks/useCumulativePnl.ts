import { useMemo, useState, useEffect } from 'react';
import { getPositions, getCurrentValueUsd } from '../config/mockPositions';

export function useCumulativePnl(): { pnlUsd: number; loading: boolean } {
	const [loading, setLoading] = useState(true);
	const positions = useMemo(() => getPositions(), []);

	useEffect(() => {
		const id = setTimeout(() => setLoading(false), 200);
		return () => clearTimeout(id);
	}, []);

	const pnlUsd = useMemo(() => {
		let sum = 0;
		for (const p of positions) {
			if (p.phase === 'private') continue; // do not reveal PnL in private

			// If fully sold
			if (p.quantity === 0 && p.realizedProceedsUsd != null) {
				sum += p.realizedProceedsUsd - p.investedUsd;
				continue;
			}

			if (p.phase === 'public') {
				const val = getCurrentValueUsd(p) ?? 0;
				sum += val - p.investedUsd;
			} else if (p.phase === 'resolved') {
				if (p.resolvedOutcome) {
					const payout = p.side === p.resolvedOutcome ? p.quantity * 1 : 0;
					sum += payout - p.investedUsd;
				}
			}
		}
		return sum;
	}, [positions]);

	return { pnlUsd, loading };
}
