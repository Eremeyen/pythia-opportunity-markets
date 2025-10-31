import type { ReactNode, CSSProperties } from "react";

type HorizontalTickerProps<T> = {
  items: T[];
  speedMs?: number;
  className?: string;
  renderItem: (item: T, index: number) => ReactNode;
  title?: string;
  reverse?: boolean;
};

export default function HorizontalTicker<T>({
  items,
  speedMs = 40_000,
  className,
  renderItem,
  title,
  reverse,
}: HorizontalTickerProps<T>) {
  const style = { ["--marquee-speed" as any]: `${speedMs}ms` } as CSSProperties;

  return (
    <section className={className} aria-label={title || undefined}>
      {title && (
        <div className="mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">{title}</h2>
        </div>
      )}
      <div className="overflow-hidden">
        <div style={style} className={`marquee-run marquee-pause flex w-max${reverse ? " marquee-reverse" : ""}`}>
          <div className="flex gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div key={`a-${idx}`} className="shrink-0">
                {renderItem(item, idx)}
              </div>
            ))}
          </div>
          <div className="flex gap-4 md:gap-6" aria-hidden>
            {items.map((item, idx) => (
              <div key={`b-${idx}`} className="shrink-0">
                {renderItem(item, idx)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


