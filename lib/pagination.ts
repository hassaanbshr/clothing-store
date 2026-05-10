export function parsePositiveIntParam(
  value: string | number | null | undefined,
  fallback: number,
  max?: number
) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const positive = Math.max(1, Math.floor(parsed));
  return max == null ? positive : Math.min(max, positive);
}
