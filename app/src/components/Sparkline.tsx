type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string | null;
  className?: string;
};

export default function Sparkline({
  values,
  width = 240,
  height = 80,
  stroke = "#0b1f3a",
  fill = null,
  className,
}: SparklineProps) {
  if (!values || values.length === 0) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const path = `M ${points}`;

  const areaPath = fill
    ? `${path} L ${width},${height} L 0,${height} Z`
    : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Price sparkline"
    >
      {fill && <path d={areaPath!} fill={fill} stroke="none" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  );
}


