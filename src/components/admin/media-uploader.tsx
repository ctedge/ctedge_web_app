"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { publicUrl } from "@/lib/r2-client";


type Prefix = "listings" | "projects" | "investments" | "brochures" | "documents" | "kyc" | "proofs";

export function MediaUploader({
  prefix,
  value,
  onChange,
  accept = "image/*",
  multiple = false,
}: {
  prefix: Prefix;
  value: string[];
  onChange: (next: string[]) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const res = await fetch("/api/r2/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", prefix }),
        });
        if (!res.ok) throw new Error("Presign failed");
        const { url, key } = (await res.json()) as { url: string; key: string };
        const put = await fetch(url, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
        if (!put.ok) throw new Error("Upload failed");
        uploaded.push(key);
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
      />
      {busy ? <p className="mt-2 text-xs text-slate-500">Uploading…</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      {value.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((key) => (
            <div key={key} className="relative h-20 w-20 overflow-hidden rounded border border-slate-200 bg-slate-50">
              {accept.startsWith("image") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicUrl(key)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">{key.split("/").pop()}</div>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((k) => k !== key))}
                className="absolute right-0 top-0 rounded-bl bg-black/60 px-1 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>Clear</Button>
        </div>
      ) : null}
    </div>
  );
}
