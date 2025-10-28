// MIGHT HAVE TO REMOVE THIS FILE, MAY BE USELESS

import { bucketAttention } from "../utils/time";

export type AttentionIndicatorProps = {
  score?: number; // 0..1
  className?: string;
};

export default function AttentionIndicator({
  score,
  className,
}: AttentionIndicatorProps) {
  const label = bucketAttention(score);
  const level = label === "Low" ? 1 : label === "Medium" ? 2 : 3;

  return (
    <div className={className} aria-label={`Attention level: ${label}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={
                "h-2 w-5 rounded-sm border-2 border-black " +
                (i < level ? "bg-[#0b1f3a]" : "bg-white")
              }
            />
          ))}
        </div>
        <span className="text-xs font-bold text-[#0b1f3a]">
          Attention: {label}
        </span>
      </div>
    </div>
  );
}
