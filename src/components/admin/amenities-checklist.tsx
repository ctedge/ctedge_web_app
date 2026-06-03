"use client";

import { useState } from "react";

const PRESETS = [
  "Prepaid meter",
  "Running water",
  "Borehole / water in compound",
  "24/7 power supply",
  "Solar / inverter backup",
  "Gated estate",
  "24/7 security",
  "CCTV",
  "Fitted kitchen",
  "Air conditioning",
  "POP ceiling",
  "Fitted wardrobes",
  "Visitor parking",
  "Swimming pool",
  "Gym",
  "En-suite bedrooms",
];

export function AmenitiesChecklist({ defaultValue }: { defaultValue?: string[] }) {
  const initial = new Set(defaultValue ?? []);
  const [selected, setSelected] = useState<Set<string>>(initial);
  const [custom, setCustom] = useState<string[]>(() =>
    (defaultValue ?? []).filter((v) => !PRESETS.includes(v))
  );
  const [draft, setDraft] = useState("");

  function toggle(name: string) {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  }

  function addCustom() {
    const v = draft.trim();
    if (!v || selected.has(v)) {
      setDraft("");
      return;
    }
    setCustom([...custom, v]);
    const next = new Set(selected);
    next.add(v);
    setSelected(next);
    setDraft("");
  }

  function removeCustom(name: string) {
    setCustom(custom.filter((c) => c !== name));
    const next = new Set(selected);
    next.delete(name);
    setSelected(next);
  }

  const all = Array.from(selected);

  return (
    <div>
      <input type="hidden" name="features" value={all.join(",")} />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {PRESETS.map((name) => (
          <label key={name} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            <input
              type="checkbox"
              checked={selected.has(name)}
              onChange={() => toggle(name)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-slate-700">{name}</span>
          </label>
        ))}
      </div>

      {custom.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {custom.map((name) => (
            <label key={name} className="flex cursor-pointer items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(name)}
                onChange={() => toggle(name)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700">{name}</span>
              <button
                type="button"
                onClick={() => removeCustom(name)}
                aria-label={`Remove ${name}`}
                className="ml-auto text-teal-700 hover:text-teal-900"
              >
                ×
              </button>
            </label>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add another amenity"
          className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
        <button
          type="button"
          onClick={addCustom}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
