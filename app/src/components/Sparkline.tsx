import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine,
} from "recharts";

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string | null;
  className?: string;
  showAxes?: boolean;
  showTooltip?: boolean;
  showCurrentRefLine?: boolean;
  useRainbowGradient?: boolean;
  yDomain?: [number | "auto", number | "auto"];
  showMidline?: boolean;
  midlineValue?: number;
  yStartAtZero?: boolean;
  timestamps?: number[]; // epoch ms for each value (optional)
};

export default function Sparkline({
  values,
  width,
  height = 80,
  stroke = "#000",
  fill: _fill = null, // kept for API compatibility (unused)
  className,
  showAxes = false,
  showTooltip = false,
  showCurrentRefLine = false,
  useRainbowGradient = false,
  yDomain,
  showMidline = false,
  midlineValue = 50,
  yStartAtZero = false,
  timestamps,
}: SparklineProps) {
  // Empty state keeps previous blank SVG behavior
  if (!values || values.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className={className ? `block ${className}` : "block"}
        aria-hidden
      >
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
      </svg>
    );
  }

  const data = useMemo(() => {
    return values.map((p, i) => ({ x: timestamps?.[i] ?? i, p }));
  }, [values, timestamps]);
  const lastPrice = values[values.length - 1];
  const gradientId = useMemo(
    () => `priceGradient-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  // Compute an effective domain if none provided:
  // - If values look like probabilities (0-100), pin top to 100 and
  //   expand lower bound with some padding so lines are not squished at the top.
  // - Otherwise, fall back to Recharts auto scaling.
  const effectiveDomain: [number | "auto", number | "auto"] = useMemo(() => {
    if (yDomain) return yDomain;
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const looksLikeProbability = dataMin >= 0 && dataMax <= 100;
    if (yStartAtZero) {
      if (looksLikeProbability) return [0, 100];
      const range = Math.max(dataMax - dataMin, 0);
      const pad = Math.max(range * 0.1, dataMax * 0.05);
      return [0, Math.ceil(dataMax + pad)];
    }
    if (looksLikeProbability) {
      const range = Math.max(dataMax - dataMin, 0);
      const pad = Math.max(range * 0.2, 2);
      const lower = Math.max(0, Math.floor(dataMin - pad));
      return [lower, 100];
    }
    return ["auto", "auto"];
  }, [yDomain, values, yStartAtZero]);

  // Container sets explicit size when caller passed width/height props.
  // When a Tailwind width class like w-full is provided, it will override this width.
  return (
    <div
      className={className}
      style={{ width: width != null ? width : "100%", height }}
      role="img"
      aria-label="Price sparkline"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
          {useRainbowGradient && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="20%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#84cc16" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="80%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          )}
          {showAxes && (
            <XAxis
              dataKey="x"
              type="number"
              stroke="#000"
              tick={{ fontSize: 12 }}
              domain={["dataMin", "dataMax"]}
              padding={{ left: 0, right: 0 }}
              minTickGap={24}
              tickFormatter={(v: number) => {
                // If looks like a timestamp, format to hour; else show index
                if (v > 1e10) {
                  const d = new Date(v);
                  return `${d.getHours().toString().padStart(2, "0")}:00`;
                }
                return String(v);
              }}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              tickLine={{ stroke: "#000", strokeWidth: 2 }}
            />
          )}
          {showAxes && (
            <YAxis
              stroke="#000"
              tick={{ fontSize: 12 }}
              domain={effectiveDomain}
              orientation="right"
              width={28}
              tickMargin={6}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              tickLine={{ stroke: "#000", strokeWidth: 2 }}
            />
          )}
          {showTooltip && (
            <Tooltip
              isAnimationActive={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const val = payload[0].value as number;
                const isTs = typeof label === "number" && label > 1e10;
                const dateStr = isTs
                  ? new Date(label as number).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : `t=${label}`;
                return (
                  <div className="rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                    <div className="text-[10px] uppercase tracking-wide text-[#0b1f3a] opacity-70">{dateStr}</div>
                    <div className="text-base font-extrabold text-[#0b1f3a] tabular-nums">{val.toFixed(1)}%</div>
                  </div>
                );
              }}
            />
          )}
          {showCurrentRefLine && lastPrice != null && (
            <ReferenceLine y={lastPrice} stroke="#000" strokeDasharray="4 4" strokeWidth={2} />
          )}
          {showMidline && (
            <ReferenceLine y={midlineValue} stroke="#000" strokeDasharray="2 2" strokeOpacity={0.3} strokeWidth={1} />
          )}
          <Line
            type="stepAfter"
            dataKey="p"
            dot={false}
            strokeWidth={3}
            stroke={useRainbowGradient ? `url(#${gradientId})` : stroke}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
