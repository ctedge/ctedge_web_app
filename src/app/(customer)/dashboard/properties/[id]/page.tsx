import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatNGN, toNumber } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { UploadProof } from "./upload-proof";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      installments: { orderBy: { dueDate: "asc" } },
      invoices: { include: { payment: true }, orderBy: { issuedAt: "desc" } },
    },
  });
  if (!purchase || (purchase.customerId !== user.id && user.role !== "ADMIN")) notFound();

  const listing = purchase.listingType === "LAND"
    ? await prisma.landListing.findUnique({ where: { id: purchase.listingId } })
    : await prisma.housingListing.findUnique({ where: { id: purchase.listingId } });

  const paid = purchase.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + toNumber(i.amount), 0);
  const total = toNumber(purchase.totalPrice);
  const balance = Math.max(0, total - paid);
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <>
      <PageHeader title={listing?.title ?? "Property"} description={`${purchase.listingType} · ${purchase.paymentMode}`} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{formatNGN(total)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-emerald-700">{formatNGN(paid)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Balance</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-teal-700">{formatNGN(balance)}</CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500"><span>Progress</span><span>{pct}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-700" style={{ width: `${pct}%` }} /></div>
        </CardContent>
      </Card>

      {purchase.installments.length ? (
        <Card className="mt-8">
          <CardHeader><CardTitle>Installment schedule</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <THead><TR><TH>Due date</TH><TH>Amount</TH><TH>Status</TH></TR></THead>
              <TBody>
                {purchase.installments.map((i) => (
                  <TR key={i.id}>
                    <TD>{format(i.dueDate, "MMM d, yyyy")}</TD>
                    <TD>{formatNGN(toNumber(i.amount))}</TD>
                    <TD>
                      <Badge variant={i.status === "PAID" ? "success" : i.status === "OVERDUE" ? "danger" : i.status === "DUE" ? "warning" : "secondary"}>
                        {i.status}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-8">
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          {purchase.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices yet. Once an admin issues one, it&apos;ll appear here.</p>
          ) : (
            <div className="space-y-3">
              {purchase.invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                  <div>
                    <div className="font-semibold text-slate-900">{inv.number}</div>
                    <div className="text-xs text-slate-500">Issued {format(inv.issuedAt, "MMM d, yyyy")}{inv.dueAt ? ` · due ${format(inv.dueAt, "MMM d, yyyy")}` : ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatNGN(toNumber(inv.amount))}</div>
                    <Badge variant={inv.status === "PAID" ? "success" : inv.status === "AWAITING_REVIEW" ? "warning" : inv.status === "CANCELLED" ? "secondary" : "danger"}>
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.payment?.receiptKey ? (
                      <Link href={`/api/receipts/${inv.id}`} target="_blank"><Button variant="outline" size="sm">Receipt</Button></Link>
                    ) : null}
                    {inv.status !== "PAID" && inv.status !== "CANCELLED" ? (
                      <UploadProof invoiceId={inv.id} />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Bank transfer details</CardTitle></CardHeader>
        <CardContent className="grid gap-1 text-sm text-slate-700">
          <div><span className="text-slate-500">Bank:</span> {process.env.NEXT_PUBLIC_BANK_NAME}</div>
          <div><span className="text-slate-500">Account name:</span> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME}</div>
          <div><span className="text-slate-500">Account number:</span> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER}</div>
          <p className="mt-2 text-xs text-slate-500">Include the invoice number as the transfer reference, then upload your payment proof above.</p>
        </CardContent>
      </Card>
    </>
  );
}
