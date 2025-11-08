import MarketPreviewCard from '../components/MarketPreviewCard';
import { getSponsorMarketsFiltered } from '../config/mockSponsorMarkets.ts';
import { useSponsorMode } from '../hooks/useSponsorMode';
import { useUserAddress } from '../hooks/useUserAddress';
import { getCurrentSponsorId } from '../config/sponsorIdentity';
import HorizontalTicker from '../components/HorizontalTicker';
import type {} from 'react';

export default function TrendingMarketsPage({
	scope = 'trending' as 'trending' | 'public' | 'private',
}: {
	scope?: 'trending' | 'public' | 'private';
}) {
	const { isSponsor } = useSponsorMode();
	const { address } = useUserAddress();
	const currentSponsorId = getCurrentSponsorId(address);
	// Split by intrinsic visibility first, then apply time-phase filters
	const publicBase = getSponsorMarketsFiltered('public');
	const privateBase = getSponsorMarketsFiltered('private');
	const now = Date.now();
	const publicItems = publicBase.filter(
		(m) =>
			m.status !== 'resolved' &&
			now >= m.opportunityEndMs &&
			(m.resultsEndMs == null || now < m.resultsEndMs),
	);
	const privateItems = privateBase.filter(
		(m) => m.status !== 'resolved' && now < m.opportunityEndMs,
	);

	const showPublic = scope === 'trending' || scope === 'public';
	const showPrivate = scope === 'trending' || scope === 'private';
	const paused = scope !== 'trending';

	return (
		<div className="flex flex-col gap-8 md:gap-10">
			{showPrivate &&
				(scope === 'trending' ? (
					<HorizontalTicker
						title="Private markets"
						items={privateItems}
						speedMs={10_000}
						reverse
						paused={paused}
						renderItem={(m) => {
							const opportunityStartMs = m.opportunityEndMs - 24 * 3600_000; // mock start time
							const isPrivateWindow = now < m.opportunityEndMs;
							return (
								<MarketPreviewCard
									key={m.id}
									id={m.id}
									logoUrl={m.company?.logoUrl ?? ''}
									title={m.title}
									description={m.description ?? ''}
									opportunityStartMs={opportunityStartMs}
									opportunityEndMs={m.opportunityEndMs}
									resultsEndMs={m.resultsEndMs}
									nextOpportunityStartMs={m.nextOpportunityStartMs}
									isPriceHidden={isPrivateWindow}
									attentionScore={m.attentionScore}
									priceSeries={m.priceSeries}
									className="w-[320px] md:w-[360px] h-[320px] overflow-hidden shrink-0"
									forceShowPrice={isSponsor && m.sponsor?.id === currentSponsorId}
								/>
							);
						}}
					/>
				) : (
					<section aria-label="Private markets">
						<div className="mb-3 md:mb-4">
							<h2 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
								Private markets
							</h2>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
							{privateItems.map((m) => {
								const opportunityStartMs = m.opportunityEndMs - 24 * 3600_000; // mock start time
								const isPrivateWindow = now < m.opportunityEndMs;
								return (
									<MarketPreviewCard
										key={m.id}
										id={m.id}
										logoUrl={m.company?.logoUrl ?? ''}
										title={m.title}
										description={m.description ?? ''}
										opportunityStartMs={opportunityStartMs}
										opportunityEndMs={m.opportunityEndMs}
										resultsEndMs={m.resultsEndMs}
										nextOpportunityStartMs={m.nextOpportunityStartMs}
										isPriceHidden={isPrivateWindow}
										attentionScore={m.attentionScore}
										priceSeries={m.priceSeries}
										className="w-full"
										forceShowPrice={
											isSponsor && m.sponsor?.id === currentSponsorId
										}
									/>
								);
							})}
						</div>
					</section>
				))}

			{showPublic &&
				(scope === 'trending' ? (
					<HorizontalTicker
						title="Public markets"
						items={publicItems}
						speedMs={13_000}
						paused={paused}
						renderItem={(m) => {
							const opportunityStartMs = m.opportunityEndMs - 24 * 3600_000; // mock start time
							const isPrivateWindow = now < m.opportunityEndMs;
							return (
								<MarketPreviewCard
									key={m.id}
									id={m.id}
									logoUrl={m.company?.logoUrl ?? ''}
									title={m.title}
									description={m.description ?? ''}
									opportunityStartMs={opportunityStartMs}
									opportunityEndMs={m.opportunityEndMs}
									resultsEndMs={m.resultsEndMs}
									nextOpportunityStartMs={m.nextOpportunityStartMs}
									isPriceHidden={isPrivateWindow}
									attentionScore={m.attentionScore}
									priceSeries={m.priceSeries}
									className="w-[320px] md:w-[360px] h-[320px] overflow-hidden shrink-0"
									forceShowPrice={isSponsor && m.sponsor?.id === currentSponsorId}
								/>
							);
						}}
					/>
				) : (
					<section aria-label="Public markets">
						<div className="mb-3 md:mb-4">
							<h2 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
								Public markets
							</h2>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
							{publicItems.map((m) => {
								const opportunityStartMs = m.opportunityEndMs - 24 * 3600_000; // mock start time
								const isPrivateWindow = now < m.opportunityEndMs;
								return (
									<MarketPreviewCard
										key={m.id}
										id={m.id}
										logoUrl={m.company?.logoUrl ?? ''}
										title={m.title}
										description={m.description ?? ''}
										opportunityStartMs={opportunityStartMs}
										opportunityEndMs={m.opportunityEndMs}
										resultsEndMs={m.resultsEndMs}
										nextOpportunityStartMs={m.nextOpportunityStartMs}
										isPriceHidden={isPrivateWindow}
										attentionScore={m.attentionScore}
										priceSeries={m.priceSeries}
										className="w-full"
										forceShowPrice={
											isSponsor && m.sponsor?.id === currentSponsorId
										}
									/>
								);
							})}
						</div>
					</section>
				))}
		</div>
	);
}
