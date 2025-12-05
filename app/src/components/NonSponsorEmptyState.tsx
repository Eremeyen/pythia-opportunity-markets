import { Link } from 'react-router-dom';

export default function NonSponsorEmptyState() {
	return (
		<div className="w-full min-h-[50vh] flex items-center justify-center">
			<div className="text-center max-w-xl">
				<h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">
					Contact us to be whitelisted as a sponsor
				</h2>
				<p className="mt-3 text-sm md:text-base text-[#0b1f3a] opacity-80">
					Sponsor access unlocks private market views, real-time trades, and resolution
					controls.
				</p>
				<div className="mt-6 flex items-center justify-center gap-3">
					<Link
						to="/sponsors"
						className="px-6 py-2 rounded-xl bg-black text-white font-bold border-4 border-black hover:opacity-90"
					>
						Learn about sponsoring
					</Link>
					<a
						href="mailto:erenonder1905@gmail.com"
						className="px-6 py-2 rounded-xl bg-white text-black font-bold border-4 border-black hover:bg-neutral-100"
					>
						Contact us
					</a>
				</div>
			</div>
		</div>
	);
}
