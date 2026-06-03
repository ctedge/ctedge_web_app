"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-5xl font-bold text-slate-200">500</div>
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-slate-500">An unexpected error occurred. Please try again.</p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">Error ID: {error.digest}</p>
        )}
        <Button className="mt-8" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
