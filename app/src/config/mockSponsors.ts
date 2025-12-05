// Helper to create a zigzaggy random-walk series in [0, 100]
function generateZigZagSeries(length: number): number[] {
	const out: number[] = [];
	let value = 50 + (Math.random() * 40 - 20);
	for (let i = 0; i < length; i++) {
		const jump = Math.random() < 0.25 ? Math.random() * 40 - 20 : 0;
		const noise = Math.random() * 14 - 7;
		value = Math.max(0, Math.min(100, value + noise + jump));
		out.push(value);
	}
	return out;
}
// Mock sponsor profiles and markets for UI prototyping.
// Temporary roles (dev-only):
// - SponsorProfile: lightweight profile data used to render sponsor sections.
// - sampleMarkets: real Market objects (from types) to populate preview cards.
// - SPONSOR_WHITELIST / SPONSOR_DEBUG_OVERRIDE: development toggles; not security.

import type { Market } from '../types/market.ts';

export type SponsorProfile = {
	id: string;
	name: string;
	description: string;
	logoUrl?: string;
	url?: string;
	// Unified typing: sampleMarkets are full Market objects
	sampleMarkets: Market[];
};

export const MOCK_SPONSORS: SponsorProfile[] = [
	{
		id: 'sp-1',
		name: 'Colleseum',
		description: 'Early-stage accelerator partnering with top founders.',
		logoUrl: '/logos/google.svg',
		url: 'https://colleseum.example',
		sampleMarkets: [
			{
				id: 's1-m1',
				title: 'Will Colleseum back Orchard AI this half?',
				description: 'Mock market for development.',
				isPriceHidden: true,
				opportunityEndMs: Date.now() + 48 * 3600_000,
				resultsEndMs: Date.now() + 30 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.6,
				resolutionCriteria:
					'Resolve to YES if Colleseum signs a term sheet with Orchard AI within the stated window.',
				sponsor: {
					id: 'sp-1',
					name: 'Colleseum',
					url: 'https://colleseum.example',
					logoUrl: '/logos/google.svg',
					description: 'Early-stage accelerator partnering with top founders.',
					focusSectors: ['AI', 'DeFi', 'Infra'],
					stageFocus: ['Pre-seed', 'Seed'],
					hq: 'Remote / Global',
					checkSizeRange: '$100k–$500k',
					thesisUrl: 'https://colleseum.example#thesis',
				},
				company: {
					id: 'c-1',
					name: 'Orchard AI',
					logoUrl: '/logos/apple.svg',
					website: 'https://example.com',
					summary: 'Applied AI company with strong early traction.',
					hq: 'San Francisco, CA',
					founder: 'Alex Park',
					founderBackground: 'Ex-Google Brain, led ML platform at a unicorn.',
					sectors: ['AI', 'Productivity'],
					foundedYear: 2024,
					totalRaisedUsd: 2500000,
					stage: 'Pre-seed',
					employees: 8,
					notableInvestors: ['AngelList Syndicate'],
				},
			},
			{
				id: 's1-m2',
				title: 'Will Colleseum fund TensorMesh by Q3?',
				description: 'Signal-driven infra bet.',
				isPriceHidden: false,
				opportunityEndMs: Date.now() + 72 * 3600_000,
				resultsEndMs: Date.now() + 40 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.72,
				resolutionCriteria:
					'Resolve to YES if Colleseum commits funding to TensorMesh before the resolution date.',
				sponsor: {
					id: 'sp-1',
					name: 'Colleseum',
					url: 'https://colleseum.example',
					logoUrl: '/logos/google.svg',
					description: 'Early-stage accelerator partnering with top founders.',
					focusSectors: ['AI', 'Infra', 'DevTools'],
					stageFocus: ['Pre-seed', 'Seed'],
					hq: 'Remote / Global',
					checkSizeRange: '$100k–$500k',
					thesisUrl: 'https://colleseum.example#thesis',
				},
				company: {
					id: 'c-2',
					name: 'TensorMesh',
					logoUrl: '/logos/nvidia.svg',
					website: 'https://example.com',
					summary: 'Infra startup exploring high-throughput compute meshes.',
					hq: 'New York, NY',
					founder: 'Priya Nair',
					founderBackground: 'Ex-NVIDIA systems engineer, distributed systems PhD.',
					sectors: ['Infrastructure', 'HPC'],
					foundedYear: 2023,
					totalRaisedUsd: 4200000,
					stage: 'Seed',
					employees: 12,
					notableInvestors: ['Acme Capital'],
				},
			},
			{
				id: 's1-m3',
				title: 'Will Colleseum sponsor CursorForge this cycle?',
				description: 'Dev-tools wedge.',
				isPriceHidden: true,
				opportunityEndMs: Date.now() + 24 * 3600_000,
				resultsEndMs: Date.now() + 25 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.5,
				resolutionCriteria:
					'Resolve to YES if Colleseum allocates capital to CursorForge during the current cycle.',
				sponsor: {
					id: 'sp-1',
					name: 'Colleseum',
					url: 'https://colleseum.example',
					logoUrl: '/logos/google.svg',
					description: 'Early-stage accelerator partnering with top founders.',
					focusSectors: ['DevTools', 'AI'],
					stageFocus: ['Pre-seed', 'Seed'],
					hq: 'Remote / Global',
					checkSizeRange: '$100k–$500k',
					thesisUrl: 'https://colleseum.example#thesis',
				},
				company: {
					id: 'c-3',
					name: 'CursorForge',
					logoUrl: '/logos/microsoft.svg',
					website: 'https://example.com',
					summary: 'Developer productivity suite for AI-augmented workflows.',
					hq: 'Austin, TX',
					founder: 'Mina Chen',
					founderBackground: 'Former Staff Engineer at GitHub Copilot team.',
					sectors: ['Developer Tools', 'AI'],
					foundedYear: 2024,
					totalRaisedUsd: 1800000,
					stage: 'Pre-seed',
					employees: 6,
					notableInvestors: ['Operator Angels'],
				},
			},
		],
	},
	{
		id: 'sp-2',
		name: 'OrangeDAO',
		description: 'Founder community supporting startups globally.',
		logoUrl: '/logos/microsoft.svg',
		url: 'https://orangedao.xyz',
		sampleMarkets: [
			{
				id: 's2-m1',
				title: 'Will OrangeDAO sponsor RiverCart by Q2?',
				description: 'Mock market for development.',
				isPriceHidden: false,
				opportunityEndMs: Date.now() + 24 * 3600_000,
				resultsEndMs: Date.now() + 20 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.45,
				resolutionCriteria:
					'Resolve to YES if OrangeDAO sponsors RiverCart prior to the resolution deadline.',
				sponsor: {
					id: 'sp-2',
					name: 'OrangeDAO',
					url: 'https://orangedao.xyz',
					logoUrl: '/logos/microsoft.svg',
					description: 'Founder community supporting startups globally.',
					focusSectors: ['Fintech', 'AI', 'Consumer'],
					stageFocus: ['Pre-seed', 'Seed'],
					hq: 'Remote / Global',
					checkSizeRange: '$50k–$250k',
					thesisUrl: 'https://orangedao.xyz#thesis',
				},
				company: {
					id: 'c-4',
					name: 'RiverCart',
					logoUrl: '/logos/amazon.svg',
					website: 'https://example.com',
					summary: 'E-commerce infra for next-gen logistics.',
					hq: 'Seattle, WA',
					founder: 'Diego Martinez',
					founderBackground: 'Ex-Amazon logistics PM, robotics background.',
					sectors: ['E-commerce', 'Logistics'],
					foundedYear: 2022,
					totalRaisedUsd: 5200000,
					stage: 'Seed',
					employees: 20,
					notableInvestors: ['OrangeDAO', 'SeedCamp'],
				},
			},
			{
				id: 's2-m2',
				title: 'Will OrangeDAO back AtlasDB this quarter?',
				description: 'Storage-first database.',
				isPriceHidden: true,
				opportunityEndMs: Date.now() + 36 * 3600_000,
				resultsEndMs: Date.now() + 22 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.58,
				resolutionCriteria:
					'Resolve to YES if OrangeDAO formalizes an investment in AtlasDB before the window closes.',
				sponsor: {
					id: 'sp-2',
					name: 'OrangeDAO',
					url: 'https://orangedao.xyz',
					logoUrl: '/logos/microsoft.svg',
					description: 'Founder community supporting startups globally.',
					focusSectors: ['Infra', 'Data'],
					stageFocus: ['Seed', 'Series A'],
					hq: 'Remote / Global',
					checkSizeRange: '$100k–$300k',
					thesisUrl: 'https://orangedao.xyz#thesis',
				},
				company: {
					id: 'c-5',
					name: 'AtlasDB',
					logoUrl: '/logos/google.svg',
					website: 'https://example.com',
					summary: 'Cloud-native database optimized for analytical workloads.',
					hq: 'Boston, MA',
					founder: "Sara O'Neill",
					founderBackground: 'Database kernel engineer, ex-Snowflake.',
					sectors: ['Data', 'Infrastructure'],
					foundedYear: 2023,
					totalRaisedUsd: 8000000,
					stage: 'Seed',
					employees: 14,
					notableInvestors: ['First Round Capital'],
				},
			},
			{
				id: 's2-m3',
				title: 'Will OrangeDAO fund Orchard AI by H1?',
				description: 'Applied AI product.',
				isPriceHidden: false,
				opportunityEndMs: Date.now() + 60 * 3600_000,
				resultsEndMs: Date.now() + 26 * 24 * 3600_000,
				priceSeries: generateZigZagSeries(24),
				attentionScore: 0.64,
				resolutionCriteria:
					'Resolve to YES if OrangeDAO signs an agreement to fund Orchard AI in the stated window.',
				sponsor: {
					id: 'sp-2',
					name: 'OrangeDAO',
					url: 'https://orangedao.xyz',
					logoUrl: '/logos/microsoft.svg',
					description: 'Founder community supporting startups globally.',
					focusSectors: ['AI', 'SaaS'],
					stageFocus: ['Pre-seed', 'Seed'],
					hq: 'Remote / Global',
					checkSizeRange: '$50k–$250k',
					thesisUrl: 'https://orangedao.xyz#thesis',
				},
				company: {
					id: 'c-6',
					name: 'Orchard AI',
					logoUrl: '/logos/apple.svg',
					website: 'https://example.com',
					summary: 'AI product suite targeting enterprise workflows.',
					hq: 'San Francisco, CA',
					founder: 'Alex Park',
					founderBackground: 'Ex-Google Brain, led ML platform at a unicorn.',
					sectors: ['AI', 'Enterprise'],
					foundedYear: 2024,
					totalRaisedUsd: 2500000,
					stage: 'Pre-seed',
					employees: 8,
					notableInvestors: ['AngelList Syndicate'],
				},
			},
		],
	},
];

// Dev-only: static whitelist of sponsor addresses. Leave empty by default.
export const SPONSOR_WHITELIST: Set<string> = new Set([
	// Example: "YourSolanaAddressHere"
]);

// Dev-only: override whitelist evaluation. true/false to force state, null to use whitelist.
export const SPONSOR_DEBUG_OVERRIDE: boolean | null = null;
