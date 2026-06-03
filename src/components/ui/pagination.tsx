import Link from "next/link";
import { Button } from "@/components/ui/button";

export const PAGE_SIZE = 10;

export function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function buildPageHref(basePath: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === 1) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, totalPages, prevHref, nextHref }: { page: number; totalPages: number; prevHref: string; nextHref: string }) {
  if (totalPages <= 1) return null;
  const atStart = page <= 1;
  const atEnd = page >= totalPages;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
      <span className="text-slate-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        {atStart ? (
          <Button variant="outline" size="sm" disabled>Prev</Button>
        ) : (
          <Link href={prevHref}><Button variant="outline" size="sm">Prev</Button></Link>
        )}
        {atEnd ? (
          <Button variant="outline" size="sm" disabled>Next</Button>
        ) : (
          <Link href={nextHref}><Button variant="outline" size="sm">Next</Button></Link>
        )}
      </div>
    </div>
  );
}
