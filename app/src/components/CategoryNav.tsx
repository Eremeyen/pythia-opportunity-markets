import { Link, useLocation } from 'react-router-dom';

function NavItem({ to, label, active }: { to?: string; label: string; active?: boolean }) {
	const common = 'px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-sm md:text-base font-extrabold';
	const activeCls = 'text-[#0b1f3a] border-b-4 border-[#0b1f3a]';
	const inactiveCls = 'text-[#0b1f3a] opacity-70 hover:opacity-100';

	if (!to) {
		return (
			<span className={common + ' ' + inactiveCls} aria-disabled>
				{label}
			</span>
		);
	}
	return (
		<Link
			to={to}
			className={common + ' ' + (active ? activeCls : inactiveCls)}
			aria-current={active ? 'page' : undefined}
		>
			{label}
		</Link>
	);
}

export default function CategoryNav() {
	const { pathname } = useLocation();
	const isSponsors = pathname.startsWith('/sponsors');
	const isTrending = pathname === '/';
	const isPublic = pathname === '/public';
	const isPrivate = pathname === '/private';

	return (
		<nav className="mt-2 md:mt-3">
			<div className="flex items-center gap-3 md:gap-4">
				<NavItem to="/" label="Trending" active={isTrending} />
				<NavItem to="/public" label="Public Markets" active={isPublic} />
				<NavItem to="/private" label="Private Markets" active={isPrivate} />
				<NavItem to="/sponsors" label="Sponsors" active={isSponsors} />
			</div>
		</nav>
	);
}
