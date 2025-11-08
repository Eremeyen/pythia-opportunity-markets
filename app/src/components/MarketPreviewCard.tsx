import Sparkline from './Sparkline';
import { formatDurationShort } from '../utils/time';
import { useCountdown, useNow } from '../hooks/useCountdown';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export type MarketPreviewCardProps = {
	// MARKET ID MAY NEED TO BE IN DIFFERENT FORMAT
	// THE TYPE OF THIS PROP MAY HAVE TO CHANGE
	id: string;
	logoUrl: string;
	title: string;
	description: string;
	opportunityStartMs: number;
	opportunityEndMs: number;
	resultsEndMs?: number;
	nextOpportunityStartMs?: number;
	isPriceHidden: boolean;
	attentionScore?: number;
	priceSeries?: number[];
	className?: string;
	forceShowPrice?: boolean;
};

function Badge({ label, value, ariaLabel }: { label: string; value: string; ariaLabel: string }) {
	return (
		<span
			className="inline-flex items-center gap-1 border-2 border-black bg-white rounded-full px-2 py-0.5 text-xs font-bold text-[#0b1f3a]"
			aria-label={ariaLabel}
		>
			<span>{label}</span>
			<span className="tabular-nums">{value}</span>
		</span>
	);
}

export default function MarketPreviewCard(props: MarketPreviewCardProps) {
	const {
		logoUrl,
		title,
		description,
		opportunityEndMs,
		resultsEndMs,
		isPriceHidden,
		priceSeries,
		className,
		forceShowPrice,
	} = props;

	const { remainingMs: oppRemainMs, isPast: oppPast } = useCountdown(opportunityEndMs);
	const now = useNow();

	const countdownSegments = useMemo(() => {
		if (!isPriceHidden) return [] as { label: string; value: string }[];
		const totalSeconds = Math.max(0, Math.floor(oppRemainMs / 1000));
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const pad = (v: number) => v.toString().padStart(2, '0');
		return [
			{ label: 'Days', value: pad(days) },
			{ label: 'Hours', value: pad(hours) },
			{ label: 'Minutes', value: pad(minutes) },
		];
	}, [isPriceHidden, oppRemainMs]);

	const showChart = !isPriceHidden;

	const resolutionDateMs = resultsEndMs ?? opportunityEndMs;
	const resolutionBadge = {
		label: 'Estimated Resolution',
		value: new Date(resolutionDateMs).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}),
	};

	const previewTimestamps = useMemo(() => {
		const len = priceSeries?.length ?? 0;
		if (len === 0) return [] as number[];
		const end = Date.now();
		const start = end - (len - 1) * 3600_000;
		return Array.from({ length: len }, (_, i) => start + i * 3600_000);
	}, [priceSeries]);

	return (
		<Link
			to={`/markets/${props.id}`}
			className={
				'block group p-[3px] rounded-2xl bg-gradient-to-r from-[#0b1f3a] via-[#174a8c] to-[#6b5b95] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white ' +
				(className ?? '')
			}
			aria-label={`Open market ${title}`}
		>
			<div className="h-full bg-white rounded-[calc(1rem-3px)] border-4 border-black p-4 md:p-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md flex flex-col">
				<div className="flex items-start gap-3">
					<div className="w-12 h-12 md:w-14 md:h-14 shrink-0 overflow-hidden">
						<img
							src={logoUrl}
							alt="Market logo"
							className="w-full h-full object-contain"
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="text-lg md:text-xl font-extrabold leading-tight text-[#0b1f3a] break-words">
							{title}
						</h3>
						<p className="mt-1 text-sm text-[#0b1f3a] line-clamp-3">{description}</p>
					</div>
				</div>

				<div className="mt-4 h-24 w-full flex items-center">
					{showChart ? (
						<Sparkline
							values={priceSeries ?? []}
							height={96}
							className="w-full h-24"
							showCurrentRefLine
							yStartAtZero
							timestamps={previewTimestamps}
						/>
					) : (
						<div className="w-full flex flex-col items-center gap-2">
							<div className="text-[11px] uppercase tracking-wide text-[#0b1f3a] opacity-70">
								Opportunity period ends in
							</div>
							<div className="flex items-center justify-center gap-2">
								{countdownSegments.map((segment) => (
									<div
										key={segment.label}
										className="min-w-[64px] rounded-xl border-2 border-black bg-white px-3 py-2 text-center shadow-[2px_2px_0_0_rgba(11,31,58,0.15)]"
									>
										<div className="text-lg font-extrabold text-[#0b1f3a] tabular-nums">
											{segment.value}
										</div>
										<div className="text-[10px] uppercase tracking-wide text-[#0b1f3a] opacity-70">
											{segment.label}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="mt-4 flex flex-wrap items-center gap-2">
					{/* @todo HAVE SOMETHING ABOUT WHEN THE NEXT OPPORTUNITY WINDOW IS RIGHT HERE */}
					<Badge
						label={resolutionBadge.label}
						value={resolutionBadge.value}
						ariaLabel={`${resolutionBadge.label} ${resolutionBadge.value}`}
					/>
					{isPriceHidden && oppPast && (
						<Badge
							label="Opportunity ended"
							value={formatDurationShort(now - opportunityEndMs) + ' ago'}
							ariaLabel={`Opportunity ended ${
								formatDurationShort(now - opportunityEndMs) + ' ago'
							}`}
						/>
					)}
				</div>
			</div>
		</Link>
	);
}
