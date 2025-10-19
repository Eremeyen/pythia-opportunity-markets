export function formatDurationShort(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatDurationColon(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function bucketAttention(score?: number): "Low" | "Medium" | "High" {
  if (score == null || Number.isNaN(score)) return "Low";
  const s = Math.max(0, Math.min(1, score));
  if (s < 0.33) return "Low";
  if (s < 0.66) return "Medium";
  return "High";
}


