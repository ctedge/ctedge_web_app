"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FeaturesEditor({ defaultValue }: { defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultValue ?? []);
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (items.includes(v)) {
      setDraft("");
      return;
    }
    setItems([...items, v]);
    setDraft("");
  }

  function remove(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <input type="hidden" name="features" value={items.join(",")} />
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Gated estate"
        />
        <Button type="button" onClick={add} variant="outline">Add</Button>
      </div>
      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span key={`${item}-${idx}`} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
              {item}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-teal-700 hover:text-teal-900"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Add features one at a time. Press Enter or click Add.</p>
      )}
    </div>
  );
}
