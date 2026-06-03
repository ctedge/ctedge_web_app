"use client";

export function DaysToMaturity({ maturityDate }: { maturityDate: Date }) {
  const ms = maturityDate.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return <>{days}</>;
}
