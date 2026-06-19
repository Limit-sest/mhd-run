export function applyTextMultiplier(text: string, multiplier: number): string {
  return text.replace(/\{(\d+(?:\.\d+)?)\}/g, (_, num) => {
    return String(Math.round(parseFloat(num) * multiplier));
  });
}

export async function share(text: string) {
  if (navigator.share) {
    navigator.share({
      text,
    });
  }
}
