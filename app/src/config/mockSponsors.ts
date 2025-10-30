// Mock sponsor profiles and markets for UI prototyping.
// Temporary roles (dev-only):
// - SponsorProfile: lightweight profile data used to render sponsor sections.
// - sampleMarkets: real Market objects (from types) to populate preview cards.
// - SPONSOR_WHITELIST / SPONSOR_DEBUG_OVERRIDE: development toggles; not security.

import type { Market } from "../types/market.ts";

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
    id: "sp-1",
    name: "AllianceDAO",
    description: "Early-stage accelerator partnering with top founders.",
    logoUrl: "/logos/google.svg",
    url: "https://alliance.xyz",
    sampleMarkets: [
      {
        id: "s1-m1",
        title: "Will Alliance back Orchard AI this half?",
        description: "Mock market for development.",
        isPriceHidden: true,
        opportunityEndMs: Date.now() + 48 * 3600_000,
        resultsEndMs: Date.now() + 30 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 100 + Math.sin(i / 3) * 2 + i * 0.3
        ),
        attentionScore: 0.6,
        sponsor: {
          id: "sp-1",
          name: "AllianceDAO",
          url: "https://alliance.xyz",
        },
        company: {
          id: "c-1",
          name: "Orchard AI",
          logoUrl: "/logos/apple.svg",
          website: "https://example.com",
          summary: "Applied AI company with strong early traction.",
        },
      },
      {
        id: "s1-m2",
        title: "Will Alliance fund TensorMesh by Q3?",
        description: "Signal-driven infra bet.",
        isPriceHidden: false,
        opportunityEndMs: Date.now() + 72 * 3600_000,
        resultsEndMs: Date.now() + 40 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 102 + Math.sin(i / 5) * 1.8 + i * 0.22
        ),
        attentionScore: 0.72,
        sponsor: {
          id: "sp-1",
          name: "AllianceDAO",
          url: "https://alliance.xyz",
        },
        company: {
          id: "c-2",
          name: "TensorMesh",
          logoUrl: "/logos/nvidia.svg",
          website: "https://example.com",
          summary: "Infra startup exploring high-throughput compute meshes.",
        },
      },
      {
        id: "s1-m3",
        title: "Will Alliance sponsor CursorForge this cycle?",
        description: "Dev-tools wedge.",
        isPriceHidden: true,
        opportunityEndMs: Date.now() + 24 * 3600_000,
        resultsEndMs: Date.now() + 25 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 98 + Math.sin(i / 4) * 2.5 + i * 0.18
        ),
        attentionScore: 0.5,
        sponsor: {
          id: "sp-1",
          name: "AllianceDAO",
          url: "https://alliance.xyz",
        },
        company: {
          id: "c-3",
          name: "CursorForge",
          logoUrl: "/logos/microsoft.svg",
          website: "https://example.com",
          summary: "Developer productivity suite for AI-augmented workflows.",
        },
      },
    ],
  },
  {
    id: "sp-2",
    name: "OrangeDAO",
    description: "Founder community supporting startups globally.",
    logoUrl: "/logos/microsoft.svg",
    url: "https://orangedao.xyz",
    sampleMarkets: [
      {
        id: "s2-m1",
        title: "Will OrangeDAO sponsor RiverCart by Q2?",
        description: "Mock market for development.",
        isPriceHidden: false,
        opportunityEndMs: Date.now() + 24 * 3600_000,
        resultsEndMs: Date.now() + 20 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 100 + Math.sin(i / 4) * 1.5 + i * 0.25
        ),
        attentionScore: 0.45,
        sponsor: {
          id: "sp-2",
          name: "OrangeDAO",
          url: "https://orangedao.xyz",
        },
        company: {
          id: "c-4",
          name: "RiverCart",
          logoUrl: "/logos/amazon.svg",
          website: "https://example.com",
          summary: "E-commerce infra for next-gen logistics.",
        },
      },
      {
        id: "s2-m2",
        title: "Will OrangeDAO back AtlasDB this quarter?",
        description: "Storage-first database.",
        isPriceHidden: true,
        opportunityEndMs: Date.now() + 36 * 3600_000,
        resultsEndMs: Date.now() + 22 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 101 + Math.sin(i / 6) * 2.2 + i * 0.2
        ),
        attentionScore: 0.58,
        sponsor: {
          id: "sp-2",
          name: "OrangeDAO",
          url: "https://orangedao.xyz",
        },
        company: {
          id: "c-5",
          name: "AtlasDB",
          logoUrl: "/logos/google.svg",
          website: "https://example.com",
          summary: "Cloud-native database optimized for analytical workloads.",
        },
      },
      {
        id: "s2-m3",
        title: "Will OrangeDAO fund Orchard AI by H1?",
        description: "Applied AI product.",
        isPriceHidden: false,
        opportunityEndMs: Date.now() + 60 * 3600_000,
        resultsEndMs: Date.now() + 26 * 24 * 3600_000,
        priceSeries: [...Array(24)].map(
          (_, i) => 99 + Math.sin(i / 3) * 1.2 + i * 0.27
        ),
        attentionScore: 0.64,
        sponsor: {
          id: "sp-2",
          name: "OrangeDAO",
          url: "https://orangedao.xyz",
        },
        company: {
          id: "c-6",
          name: "Orchard AI",
          logoUrl: "/logos/apple.svg",
          website: "https://example.com",
          summary: "AI product suite targeting enterprise workflows.",
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
