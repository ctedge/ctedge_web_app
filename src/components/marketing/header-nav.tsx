"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeaderNavItem = { href: string; label: string };

export function HeaderNav({
  items,
  authSlot,
  mobileAuthSlot,
}: {
  items: HeaderNavItem[];
  authSlot: ReactNode;
  mobileAuthSlot: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {items.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-sm font-medium transition",
                active ? "text-[#011F54]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex md:items-center md:gap-2">{authSlot}</div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white shadow-lg">
            <nav className="flex flex-col p-2">
              {items.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium",
                      active ? "bg-slate-100 text-[#011F54]" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 p-4">{mobileAuthSlot}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
