"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProofLink({ proofKey, label = "View proof" }: { proofKey: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  async function open() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/by-key?key=${encodeURIComponent(proofKey)}`);
      if (res.redirected) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else if (res.ok) {
        const { url } = (await res.json()) as { url?: string };
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoading(false);
    }
  }
  return <Button size="sm" variant="outline" onClick={open} disabled={loading}>{loading ? "…" : label}</Button>;
}
