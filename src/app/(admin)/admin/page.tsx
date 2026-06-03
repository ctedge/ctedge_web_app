import { type Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Admin Dashboard" };
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireRole("ADMIN");

  const [customers, investors, openInvoices, pendingInvestments, awaitingReview, totalPaidAgg, totalInvestedAgg, recentLeads, recentBookings] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "INVESTOR" } }),
    prisma.invoice.count({ where: { status: { in: ["UNPAID", "AWAITING_REVIEW"] } } }),
    prisma.investment.count({ where: { status: "PENDING" } }),
    prisma.invoice.findMany({ where: { status: "AWAITING_REVIEW" }, orderBy: { issuedAt: "desc" }, take: 5 }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.investment.aggregate({ where: { status: { in: ["APPROVED", "MATURED"] } }, _sum: { amount: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.inspectionBooking.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <>
      <PageHeader title="Admin overview" description="Key metrics and pending actions." />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Customers</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{customers}</CardContent></Card>
        <Card><CardHeader><CardTitle>Investors</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{investors}</CardContent></Card>
        <Card><CardHeader><CardTitle>Payments received</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-emerald-700">{formatNGN(toNumber(totalPaidAgg._sum.amount ?? 0))}</CardContent></Card>
        <Card><CardHeader><CardTitle>Capital invested</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-teal-700">{formatNGN(toNumber(totalInvestedAgg._sum.amount ?? 0))}</CardContent></Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending review</CardTitle>
              <Link href="/admin/invoices" className="text-xs font-semibold text-teal-700 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {awaitingReview.length === 0 ? (
              <p className="text-sm text-slate-500">No invoices awaiting review.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {awaitingReview.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold">{inv.number}</div>
                      <div className="text-xs text-slate-500">Issued {format(inv.issuedAt, "MMM d, yyyy")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNGN(toNumber(inv.amount))}</div>
                      <Badge variant="warning">AWAITING REVIEW</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex gap-3 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{openInvoices} open invoices</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{pendingInvestments} pending investments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest leads</CardTitle>
              <Link href="/admin/leads" className="text-xs font-semibold text-teal-700 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-slate-500">No leads yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentLeads.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-xs text-slate-500">{l.phone}{l.source ? ` · ${l.source}` : ""}</div>
                    </div>
                    <div className="text-xs text-slate-500">{format(l.createdAt, "MMM d")}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Latest inspection bookings</CardTitle>
            <Link href="/admin/bookings" className="text-xs font-semibold text-teal-700 hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No inspection bookings yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.phone} · {format(b.preferredDate, "MMM d, yyyy")}</div>
                  </div>
                  <Badge>{b.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
