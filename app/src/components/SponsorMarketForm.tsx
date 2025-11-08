import { useState } from 'react';

export type CreateMarketInput = {
	title: string;
	description?: string;
	liquidity: number;
	resolutionDateMs: number;
	resolutionCriteria: string;
	isPrivate: boolean;
};

export default function SponsorMarketForm({
	onCreate,
	onClose,
}: {
	onCreate: (input: CreateMarketInput) => void;
	onClose: () => void;
}) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [liquidity, setLiquidity] = useState<number>(100);
	const [resolutionDate, setResolutionDate] = useState<string>('');
	const [criteria, setCriteria] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!title || !resolutionDate || !criteria || !liquidity || isSubmitting) return;
		setIsSubmitting(true);
		const input: CreateMarketInput = {
			title,
			description: description || undefined,
			liquidity: Number(liquidity),
			resolutionDateMs: new Date(resolutionDate).getTime(),
			resolutionCriteria: criteria,
			isPrivate: true,
		};
		// Simulate network delay for demo
		setTimeout(() => {
			onCreate(input);
			setIsSubmitting(false);
			onClose();
		}, 2000);
	}

	return (
		<div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:backdrop-blur flex items-end md:items-center justify-center p-4">
			<div className="w-full max-w-2xl bg-white rounded-2xl border-4 border-black p-4 md:p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<h3 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
						Create Market
					</h3>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black hover:bg-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						Close
					</button>
				</div>
				<form className="mt-4 space-y-4" onSubmit={submit} aria-busy={isSubmitting}>
					<div>
						<label className="block text-sm font-bold mb-1">Market name</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 rounded-lg border-2 border-black disabled:bg-neutral-100 disabled:cursor-not-allowed"
							placeholder="e.g. Will we fund Orchard AI by Q3?"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-bold mb-1">Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 rounded-lg border-2 border-black min-h-[80px] disabled:bg-neutral-100 disabled:cursor-not-allowed"
							placeholder="Short description"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div>
							<label className="block text-sm font-bold mb-1">Liquidity (SOL)</label>
							<input
								type="number"
								min={1}
								step={0.1}
								value={liquidity}
								onChange={(e) => setLiquidity(Number(e.target.value))}
								disabled={isSubmitting}
								className="w-full px-3 py-2 rounded-lg border-2 border-black disabled:bg-neutral-100 disabled:cursor-not-allowed"
								required
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-bold mb-1">Resolution date</label>
							<input
								type="date"
								value={resolutionDate}
								onChange={(e) => setResolutionDate(e.target.value)}
								disabled={isSubmitting}
								className="w-full px-3 py-2 rounded-lg border-2 border-black disabled:bg-neutral-100 disabled:cursor-not-allowed"
								required
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-bold mb-1">Resolution criteria</label>
						<textarea
							value={criteria}
							onChange={(e) => setCriteria(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 rounded-lg border-2 border-black min-h-[100px] disabled:bg-neutral-100 disabled:cursor-not-allowed"
							placeholder="Define clear criteria for YES/NO"
							required
						/>
					</div>
					{/* Markets are created private by default in v1 */}
					<div className="pt-2">
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-5 py-2 rounded-xl bg-black text-white font-extrabold border-4 border-black hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<span className="inline-flex items-center gap-2">
									<svg
										className="h-4 w-4 animate-spin text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
										></path>
									</svg>
									Creating...
								</span>
							) : (
								'Create market'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
