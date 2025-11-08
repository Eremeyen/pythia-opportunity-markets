import { useCountdown } from './useCountdown';

type UseMarketTimingInput = {
	opportunityEndMs: number;
	resultsEndMs?: number;
	nextOpportunityStartMs?: number;
};

type Countdown = ReturnType<typeof useCountdown> & { targetMs: number };

export type MarketTiming = {
	opportunity: Countdown;
	resolution: Countdown;
	nextWindow?: Countdown;
	inOpportunityWindow: boolean;
	inPublicWindow: boolean;
};

export function useMarketTiming({
	opportunityEndMs,
	resultsEndMs,
	nextOpportunityStartMs,
}: UseMarketTimingInput): MarketTiming {
	const opportunity = {
		...useCountdown(opportunityEndMs),
		targetMs: opportunityEndMs,
	};

	const resolutionTargetMs = resultsEndMs ?? opportunityEndMs;
	const resolution = {
		...useCountdown(resolutionTargetMs),
		targetMs: resolutionTargetMs,
	};

	const nextWindow = nextOpportunityStartMs
		? {
				...useCountdown(nextOpportunityStartMs),
				targetMs: nextOpportunityStartMs,
			}
		: undefined;

	// Treat the private window purely as the time before opportunityEndMs
	const inOpportunityWindow = !opportunity.isPast;
	const inPublicWindow = !inOpportunityWindow && !resolution.isPast;

	return {
		opportunity,
		resolution,
		nextWindow,
		inOpportunityWindow,
		inPublicWindow,
	};
}
