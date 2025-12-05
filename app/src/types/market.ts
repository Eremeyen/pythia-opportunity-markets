export type Sponsor = {
	id: string;
	name: string;
	url?: string;
	avatarUrl?: string;
	org?: string;
	// Optional richer profile fields for UI
	logoUrl?: string;
	description?: string;
	focusSectors?: string[];
	stageFocus?: string[];
	hq?: string;
	checkSizeRange?: string;
	thesisUrl?: string;
};

export type Company = {
	id: string;
	name: string;
	logoUrl?: string;
	website?: string;
	summary?: string;
	// Optional richer company details for UI
	hq?: string;
	founder?: string;
	founderBackground?: string;
	sectors?: string[];
	foundedYear?: number;
	totalRaisedUsd?: number;
	stage?: string;
	employees?: number;
	notableInvestors?: string[];
};

// CHANGE TIME FIELDS
export type Market = {
	id: string;
	title: string;
	description?: string;
	isPriceHidden: boolean;
	opportunityEndMs: number;
	resultsEndMs?: number;
	priceSeries?: number[];
	attentionScore?: number;
	sponsor: Sponsor;
	company: Company;
	resolutionCriteria: string;
	nextOpportunityStartMs?: number;
	nextOpportunityEndMs?: number;
};
