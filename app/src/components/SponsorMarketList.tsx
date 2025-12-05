import type { SponsorMarket } from '../config/mockSponsorMarkets';

export default function SponsorMarketList({
	markets,
	selectedId,
	onSelect,
	onCreateClick,
	title = 'Your markets',
	showCreate = true,
}: {
	markets: SponsorMarket[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	onCreateClick: () => void;
	title?: string;
	showCreate?: boolean;
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="text-lg md:text-xl font-extrabold text-[#0b1f3a]">{title}</h3>
				{showCreate && (
					<button
						type="button"
						onClick={onCreateClick}
						className="px-4 py-2 rounded-xl bg-white text-black font-extrabold border-4 border-black hover:bg-neutral-100"
					>
						Create market
					</button>
				)}
			</div>
			<div className="divide-y-2 divide-black/10 border-2 border-black/10 rounded-xl overflow-hidden bg-white">
				{markets.map((m) => {
					const isSel = m.id === selectedId;
					const now = Date.now();
					const isResolved = m.status === 'resolved';
					const inOpportunity = !isResolved && now < m.opportunityEndMs;
					const windowLabel = isResolved
						? 'Resolved'
						: inOpportunity
							? 'Opportunity'
							: 'Public';
					return (
						<button
							key={m.id}
							onClick={() => onSelect(m.id)}
							className={`w-full text-left px-4 py-3 flex items-center justify-between ${
								isSel ? 'bg-black/5' : 'bg-white'
							}`}
						>
							<div>
								<div className="font-bold text-[#0b1f3a]">{m.title}</div>
								<div className="text-xs text-[#0b1f3a] opacity-70 mt-0.5">
									{m.isPrivate ? 'Private' : 'Public'} · Liquidity{' '}
									{m.liquidity.toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}{' '}
									SOL
								</div>
							</div>
							<div className="text-xs">
								<span
									className={`px-2 py-1 rounded-full border-2 ${
										isResolved
											? 'border-slate-700 text-slate-800'
											: inOpportunity
												? 'border-amber-700 text-amber-800'
												: 'border-emerald-700 text-emerald-800'
									}`}
								>
									{windowLabel}
								</span>
							</div>
						</button>
					);
				})}
				{markets.length === 0 && (
					<div className="px-4 py-6 text-sm text-[#0b1f3a] opacity-70">
						No markets yet.
					</div>
				)}
			</div>
		</div>
	);
}
