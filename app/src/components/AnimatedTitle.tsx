import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TITLE_ANIMATION } from '../config/animation';

type AnimatedTitleProps = {
	full: string;
	short: string;
	className?: string;
	/** Delay before the collapse animation starts (ms). */
	delayMs?: number;
	/** If true, play the animation once per tab session only. */
	oncePerSession?: boolean;
};

function usePrefersReducedMotion(): boolean {
	const [prefers, setPrefers] = useState(false);
	useEffect(() => {
		if (typeof window === 'undefined' || !('matchMedia' in window)) return;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setPrefers(media.matches);
		update();
		if (typeof media.addEventListener === 'function') {
			media.addEventListener('change', update);
			return () => media.removeEventListener('change', update);
		}
		media.addListener?.(update);
		return () => {
			media.removeListener?.(update);
		};
	}, []);
	return prefers;
}

const WIDTH_DURATION_S = TITLE_ANIMATION.WIDTH_DURATION_S;
const FADE_DURATION_S = TITLE_ANIMATION.FADE_DURATION_S;
const WIDTH_EASE_CSS = `cubic-bezier(${TITLE_ANIMATION.WIDTH_EASE.join(', ')})`;
const FADE_EASE_CSS = TITLE_ANIMATION.FADE_EASE === 'easeOut' ? 'ease-out' : 'ease';

export default function AnimatedTitle({
	full,
	short,
	className,
	delayMs = TITLE_ANIMATION.DELAY_MS,
	oncePerSession = true,
}: AnimatedTitleProps) {
	const fullRef = useRef<HTMLSpanElement | null>(null);
	const shortRef = useRef<HTMLSpanElement | null>(null);
	const [fullWidth, setFullWidth] = useState<number | null>(null);
	const [shortWidth, setShortWidth] = useState<number | null>(null);
	const [showShortImmediately, setShowShortImmediately] = useState(false);
	const [hasPlayed, setHasPlayed] = useState(false);
	const [showShort, setShowShort] = useState(false);
	const prefersReducedMotion = usePrefersReducedMotion();

	// Measure widths (intrinsic) of full and short titles
	useLayoutEffect(() => {
		const measure = () => {
			const fullEl = fullRef.current;
			const shortEl = shortRef.current;
			if (!fullEl || !shortEl) return;
			const fullBox = fullEl.getBoundingClientRect();
			const shortBox = shortEl.getBoundingClientRect();
			const f = Math.ceil(Math.max(fullEl.scrollWidth, fullBox.width));
			const s = Math.ceil(Math.max(shortEl.scrollWidth, shortBox.width));
			if (!Number.isNaN(f)) setFullWidth(f);
			if (!Number.isNaN(s)) setShortWidth(s);
		};

		measure();
		const raf = window.requestAnimationFrame(measure);
		// Re-measure once fonts are ready to avoid late font swaps changing width
		// @ts-ignore: optional chaining for older TS DOM lib
		document.fonts?.ready?.then?.(() => measure()).catch(() => {});
		window.addEventListener('resize', measure);
		return () => {
			window.cancelAnimationFrame(raf);
			window.removeEventListener('resize', measure);
		};
	}, []);

	// Decide whether to skip animation
	useEffect(() => {
		const sessionKey = 'AnimatedTitlePlayed';
		const alreadyPlayed =
			oncePerSession && typeof window !== 'undefined'
				? window.sessionStorage.getItem(sessionKey) === '1'
				: false;
		const shouldSkip = prefersReducedMotion || alreadyPlayed;
		if (shouldSkip) {
			setShowShortImmediately(true);
			setHasPlayed(true);
			setShowShort(true);
		}
	}, [oncePerSession, prefersReducedMotion]);

	// Trigger animation after delay
	useEffect(() => {
		if (showShortImmediately) return;
		if (hasPlayed) return;
		if (fullWidth == null || shortWidth == null) return;
		const timer = window.setTimeout(() => {
			setShowShort(true);
			setHasPlayed(true);
			if (oncePerSession) {
				try {
					window.sessionStorage.setItem('AnimatedTitlePlayed', '1');
				} catch {}
			}
		}, delayMs);
		return () => window.clearTimeout(timer);
	}, [showShortImmediately, hasPlayed, fullWidth, shortWidth, delayMs, oncePerSession]);

	const containerWidthPx = (() => {
		if (showShort) return shortWidth ?? undefined;
		return fullWidth ?? undefined;
	})();

	const ready = fullWidth != null && shortWidth != null;

	return (
		<span
			className={className}
			style={{
				display: 'inline-block',
				width: ready ? (containerWidthPx ? `${containerWidthPx}px` : undefined) : undefined,
				transition: ready ? `width ${WIDTH_DURATION_S}s ${WIDTH_EASE_CSS}` : undefined,
			}}
			aria-live="polite"
		>
			{/* Hidden measuring nodes */}
			<span
				style={{
					position: 'absolute',
					visibility: 'hidden',
					whiteSpace: 'nowrap',
				}}
				ref={fullRef}
			>
				{full}
			</span>
			<span
				style={{
					position: 'absolute',
					visibility: 'hidden',
					whiteSpace: 'nowrap',
				}}
				ref={shortRef}
			>
				<abbr title={full} style={{ textDecoration: 'none' }}>
					{short}
				</abbr>
			</span>

			{/* Visible cross-fade stack */}
			<span
				style={{
					position: 'relative',
					display: 'inline-block',
					whiteSpace: 'nowrap',
				}}
			>
				{/* Full text */}
				<span
					aria-hidden={showShort}
					style={{
						position: 'absolute',
						inset: 0,
						opacity: showShort ? 0 : 1,
						transform: showShort
							? `translateX(-${TITLE_ANIMATION.SHIFT_PX}px)`
							: 'translateX(0px)',
						transition: `opacity ${FADE_DURATION_S}s ${FADE_EASE_CSS}, transform ${FADE_DURATION_S}s ${FADE_EASE_CSS}`,
					}}
				>
					{full}
				</span>

				{/* Short text */}
				<span
					aria-hidden={!showShort}
					style={{
						position: 'relative',
						opacity: showShort ? 1 : 0,
						transform: showShort
							? 'translateY(0px) scale(1)'
							: `translateY(${TITLE_ANIMATION.SMALL_Y_OFFSET_PX}px) scale(${TITLE_ANIMATION.SMALL_NEAR_SCALE})`,
						transition: `opacity ${FADE_DURATION_S}s ${FADE_EASE_CSS}, transform ${FADE_DURATION_S}s ${FADE_EASE_CSS}`,
					}}
				>
					<abbr title={full} style={{ textDecoration: 'none' }}>
						{short}
					</abbr>
				</span>
			</span>
		</span>
	);
}
