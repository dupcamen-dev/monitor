export function secToInterval(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec % 3600 === 0) return `${sec / 3600}h`;
  return `${Math.round(sec / 60)}m`;
}

export function intervalToSec(interval: string): number {
  const v = interval.replace("every ", "").trim();
  const n = parseInt(v, 10);
  if (v.endsWith("s")) return Number.isNaN(n) ? 60 : n;
  if (v.endsWith("h")) return (Number.isNaN(n) ? 1 : n) * 3600;
  return (Number.isNaN(n) ? 1 : n) * 60;
}
