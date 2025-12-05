import type { Market } from '../types/market';
import { MOCK_SPONSORS } from './mockSponsors';

export type Resolution = 'YES' | 'NO' | null;

export type SponsorMarket = Market & {
	liquidity: number; // in SOL (mock)
	resolutionCriteria: string;
	isPrivate: boolean; // mirrors isPriceHidden but explicit for UI filters
	status: 'open' | 'resolved';
	resolution: Resolution;
	nextOpportunityStartMs?: number;
	nextOpportunityEndMs?: number;
};

export const MOCK_SPONSOR_MARKETS: SponsorMarket[] = (() => {
	const seeded: SponsorMarket[] = [];
	for (const sp of MOCK_SPONSORS) {
		for (const m of sp.sampleMarkets) {
			seeded.push({
				...m,
				liquidity: Math.round((50 + Math.random() * 200) * 100) / 100,
				resolutionCriteria:
					'Sponsor will resolve to YES if funding decision is affirmative within the window.',
				isPrivate: !!m.isPriceHidden,
				status: 'open',
				resolution: null,
			});
		}
	}
	// Ensure at least one public-window market for testing:
	// Pick the first non-private, set opportunityEndMs in the past and resultsEndMs in the future
	const idx = seeded.findIndex((mk) => !mk.isPrivate);
	if (idx >= 0) {
		const now = Date.now();
		const mk = seeded[idx];
		seeded[idx] = {
			...mk,
			opportunityEndMs: now - 2 * 3600_000, // 2h ago
			resultsEndMs: now + 7 * 24 * 3600_000, // resolves in 7d
			nextOpportunityStartMs: now + 2 * 24 * 3600_000, // in 2d
			nextOpportunityEndMs: now + 3 * 24 * 3600_000, // lasts 1d
		} as SponsorMarket;
	}

	// Lightly expand dataset to ensure minimum counts for public/private
	const ensureMinCounts = (publicMin = 12, privateMin = 12) => {
		const pubs = seeded.filter((m) => !m.isPrivate);
		const privs = seeded.filter((m) => m.isPrivate);

		const ALT_COMPANY_NAMES = [
			'Kinetic Labs',
			'VectorHub',
			'DriftScale',
			'SynthOS',
			'LumaGraph',
			'LoomStack',
			'RiverCart',
			'AtlasDB',
			'AeroChain',
			'NimbusDB',
			'QuantaOps',
			'HelioForge',
		];
		const ALT_LOGOS = [
			'/logos/apple.svg',
			'/logos/google.svg',
			'/logos/amazon.svg',
			'/logos/microsoft.svg',
			'/logos/nvidia.svg',
		];

		const makeClone = (m: SponsorMarket, i: number): SponsorMarket => {
			const newCompanyName = ALT_COMPANY_NAMES[i % ALT_COMPANY_NAMES.length];
			const oldCompanyName = m.company?.name;
			let newTitle = m.title;
			if (oldCompanyName && newTitle.includes(oldCompanyName)) {
				newTitle = newTitle.replace(oldCompanyName, newCompanyName);
			} else {
				const sponsorName = m.sponsor?.name ?? 'Sponsor';
				newTitle = `Will ${sponsorName} back ${newCompanyName} this cycle?`;
			}
			const newLogo = ALT_LOGOS[i % ALT_LOGOS.length];
			return {
				...m,
				id: `${m.id}-alt-${i}`,
				title: newTitle,
				company: {
					...(m.company ?? { id: `c-${m.id}` }),
					id: `${m.company?.id ?? `c-${m.id}`}-alt-${i}`,
					name: newCompanyName,
					logoUrl: newLogo,
				},
				priceSeries: (m.priceSeries ?? []).map((v) =>
					Math.max(0, v + (Math.random() - 0.5) * 2),
				),
				attentionScore: Math.max(
					1,
					Math.min(
						100,
						(m.attentionScore ?? 50) + Math.round((Math.random() - 0.5) * 10),
					),
				),
			};
		};

		if (pubs.length > 0) {
			for (let i = 0; pubs.length < publicMin; i++) {
				const clone = makeClone(pubs[i % pubs.length], i);
				pubs.push(clone);
				seeded.push(clone);
			}
		}

		if (privs.length > 0) {
			for (let i = 0; privs.length < privateMin; i++) {
				const clone = makeClone(privs[i % privs.length], i);
				privs.push(clone);
				seeded.push(clone);
			}
		}
	};

	ensureMinCounts();
	return seeded;
})();

const STORAGE_KEY = 'createdSponsorMarketsV1';

function readPersistedCreated(): SponsorMarket[] {
	try {
		if (typeof window === 'undefined') return [];
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as SponsorMarket[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function persistCreatedMarket(m: SponsorMarket): void {
	try {
		if (typeof window === 'undefined') return;
		const current = readPersistedCreated();
		const idx = current.findIndex((x) => x.id === m.id);
		const next = idx >= 0 ? current.map((x) => (x.id === m.id ? m : x)) : [m, ...current];
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {}
}

export function updatePersistedMarketResolution(marketId: string, resolution: 'YES' | 'NO'): void {
	try {
		if (typeof window === 'undefined') return;
		const current = readPersistedCreated();
		const next = current.map((x) =>
			x.id === marketId ? { ...x, status: 'resolved', resolution } : x,
		);
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {}
}

// Hydrate persisted created markets on module load
(() => {
	const saved = readPersistedCreated();
	if (saved.length > 0) {
		for (const m of saved) {
			if (!MOCK_SPONSOR_MARKETS.some((x) => x.id === m.id)) {
				MOCK_SPONSOR_MARKETS.unshift(m);
			}
		}
	}
})();

// Ephemeral container for markets created during the session (clears on reload)
export function getSponsorMarketsFiltered(
	scope: 'trending' | 'public' | 'private',
): SponsorMarket[] {
	const now = Date.now();
	if (scope === 'public') {
		// Public window: opportunity ended, but results window still active (or unspecified)
		return MOCK_SPONSOR_MARKETS.filter(
			(m) =>
				m.status !== 'resolved' &&
				now >= m.opportunityEndMs &&
				(m.resultsEndMs == null || now < m.resultsEndMs),
		);
	}
	if (scope === 'private') {
		// Private window: opportunity still ongoing
		return MOCK_SPONSOR_MARKETS.filter(
			(m) => m.status !== 'resolved' && now < m.opportunityEndMs,
		);
	}
	return MOCK_SPONSOR_MARKETS;
}
