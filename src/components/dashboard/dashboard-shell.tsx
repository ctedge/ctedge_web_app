import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/auth";

export type NavItem = { href: string; label: string; icon?: ReactNode };

export function DashboardShell({
  title,
  nav,
  user,
  children,
}: {
  title: string;
  nav: NavItem[];
  user: { name?: string | null; email?: string | null; role?: string };
  children: ReactNode;
}) {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white font-bold">{company.slice(0, 1)}</span>
            <span className="text-sm font-semibold text-slate-900">{company}</span>
          </Link>
          <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              {n.icon}
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-700">{user.name ?? user.email}</div>
          <div>{user.role}</div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="mt-3">
            <button type="submit" className="text-sm font-semibold text-teal-700 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="flex-1">
        <header className="border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{title}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="text-sm font-semibold text-teal-700">Sign out</button>
            </form>
          </div>
          <nav className="mt-3 flex flex-wrap gap-3 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded bg-slate-100 px-3 py-1 text-slate-700">{n.label}</Link>
            ))}
          </nav>
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
