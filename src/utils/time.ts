const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

export function formatDuration(ms: number): string | null {
  if (ms < 0) return null;

  const minutes = Math.floor((ms % HOUR) / MINUTE);
  const seconds = String(Math.floor((ms % MINUTE) / SECOND)).padStart(2, '0');

  return `${minutes}m${seconds}s`;
}
