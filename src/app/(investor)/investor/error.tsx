"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InvestorError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-5xl font-bold text-slate-200">500</div>
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-slate-500">An unexpected error occurred. Please try again.</p>
      {error.digest && <p className="mt-2 text-xs text-slate-400">Error ID: {error.digest}</p>}
      <div className="mt-8 flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/investor" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50">
          Go to portal
        </Link>
      </div>
    </div>
  );
}
