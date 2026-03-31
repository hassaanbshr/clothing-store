export function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function formatReviewCount(count: number, qualifier?: string) {
  const parts = [String(count)];

  if (qualifier) {
    parts.push(qualifier);
  }

  parts.push(count === 1 ? "review" : "reviews");

  return parts.join(" ");
}
