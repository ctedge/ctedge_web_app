"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  dashboardHref: string;
};

function initialsOf(user: UserMenuUser) {
  const src = user.name?.trim() || user.email?.trim() || "?";
  const parts = src.split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : src.slice(0, 2);
  return letters.toUpperCase();
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1.5 py-1 pr-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#011F54] text-xs font-semibold text-white">
          {initialsOf(user)}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {user.name ?? user.email}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn("h-4 w-4 text-slate-500 transition", open && "rotate-180")}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="truncate text-sm font-semibold text-slate-900">
              {user.name ?? "Signed in"}
            </div>
            {user.email ? (
              <div className="truncate text-xs text-slate-500">{user.email}</div>
            ) : null}
            <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {user.role}
            </div>
          </div>
          <Link
            href={user.dashboardHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
