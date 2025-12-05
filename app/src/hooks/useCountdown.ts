import { useEffect, useMemo, useRef, useState } from 'react';

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

export function useCountdown(targetMs: number): {
	nowMs: number;
	remainingMs: number;
	isPast: boolean;
} {
	const prefersReducedMotion = usePrefersReducedMotion();
	const [nowMs, setNowMs] = useState<number>(() => Date.now());
	const intervalRef = useRef<number | null>(null);

	useEffect(() => {
		const tickMs = prefersReducedMotion ? 60_000 : 1_000; // 1m vs 1s
		const tick = () => setNowMs(Date.now());
		tick();
		intervalRef.current = window.setInterval(tick, tickMs);
		return () => {
			if (intervalRef.current != null) window.clearInterval(intervalRef.current);
		};
	}, [prefersReducedMotion]);

	const remainingMs = useMemo(() => Math.max(0, targetMs - nowMs), [targetMs, nowMs]);
	const isPast = remainingMs === 0 && nowMs >= targetMs;
	return { nowMs, remainingMs, isPast };
}

export function useNow(): number {
	const prefersReducedMotion = usePrefersReducedMotion();
	const [nowMs, setNowMs] = useState<number>(() => Date.now());
	useEffect(() => {
		const tickMs = prefersReducedMotion ? 60_000 : 1_000;
		const id = window.setInterval(() => setNowMs(Date.now()), tickMs);
		return () => window.clearInterval(id);
	}, [prefersReducedMotion]);
	return nowMs;
}
