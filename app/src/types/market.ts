export type Sponsor = {
  id: string;
  name: string;
  url?: string;
  avatarUrl?: string;
  org?: string;
};

export type Company = {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  summary?: string;
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
};
