export function formatNGN(amount: number | string | { toString(): string }, opts?: { withSymbol?: boolean }): string {
  const n = typeof amount === "number" ? amount : Number(amount.toString());
  if (!Number.isFinite(n)) return opts?.withSymbol === false ? "0" : "₦0";
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return opts?.withSymbol === false ? formatted : `₦${formatted}`;
}

export function formatUSD(amount: number, rate = 1600): string {
  const usd = amount / rate;
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(usd)}`;
}

export function toNumber(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0;
  if (typeof d === "number") return d;
  return Number(d.toString());
}
