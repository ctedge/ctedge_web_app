"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DocumentDownload({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/url`);
      if (!res.ok) throw new Error("Could not get download URL");
      const { url } = (await res.json()) as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={open} disabled={loading}>
      {loading ? "Opening…" : "Download"}
    </Button>
  );
}
