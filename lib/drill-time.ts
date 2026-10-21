// How long a drill took, as the mobile celebration says it: "2 minutes 41",
// "1 minute", "45 seconds".
export function drillTime(seconds: number): string {
  const s = Math.max(1, Math.round(seconds));
  if (s < 60) return s === 1 ? "1 second" : `${s} seconds`;
  const minutes = Math.floor(s / 60);
  const rest = s % 60;
  const head = minutes === 1 ? "1 minute" : `${minutes} minutes`;
  return rest === 0 ? head : `${head} ${rest}`;
}
