import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ invPage?: string; payPage?: string }> }) {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  const { invPage: rawInv, payPage: rawPay } = await searchParams;

  const ownership: Prisma.InvoiceWhereInput = {
    OR: [
      { purchase: { customerId: user.id } },
      { investment: { investorId: user.id } },
    ],
  };

  const [invoiceTotal, paymentTotal] = await Promise.all([
    prisma.invoice.count({ where: { ...ownership, status: { not: "PAID" } } }),
    prisma.payment.count({ where: { invoice: ownership } }),
  ]);

  const invoiceTotalPages = Math.max(1, Math.ceil(invoiceTotal / PAGE_SIZE));
  const paymentTotalPages = Math.max(1, Math.ceil(paymentTotal / PAGE_SIZE));
  const invPage = Math.min(parsePage(rawInv), invoiceTotalPages);
  const payPage = Math.min(parsePage(rawPay), paymentTotalPages);

  const [outstandingInvoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { ...ownership, status: { not: "PAID" } },
      include: { purchase: true, investment: true },
      orderBy: { issuedAt: "desc" },
      skip: (invPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.payment.findMany({
      where: { invoice: ownership },
      include: { invoice: true },
      orderBy: { paidAt: "desc" },
      skip: (payPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const buildHref = (i: number, p: number) => buildPageHref("/dashboard/payments", { invPage: i, payPage: p });

  const invoiceStatusVariant = (s: string): "danger" | "warning" | "secondary" | "success" => {
    if (s === "AWAITING_REVIEW") return "warning";
    if (s === "CANCELLED") return "secondary";
    return "danger";
  };

  const invoiceTarget = (inv: { id: string; purchaseId: string | null; investmentId: string | null }) =>
    inv.purchaseId ? `/dashboard/payments/${inv.id}` : inv.investmentId ? `/investor/payments/${inv.id}` : "#";

  return (
    <>
      <PageHeader title="Invoices & payments" description="Track outstanding invoices and download receipts for confirmed payments." />

      <Card className="mb-6">
        <CardContent className="p-0">
          {outstandingInvoices.length === 0 ? (
            <div className="p-6"><Empty title="No outstanding invoices" description="When an invoice is issued to you it will appear here." /></div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Issued</TH>
                  <TH>Invoice</TH>
                  <TH>Amount</TH>
                  <TH>Due</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Action</TH>
                </TR>
              </THead>
              <TBody>
                {outstandingInvoices.map((inv) => (
                  <TR key={inv.id}>
                    <TD>{format(inv.issuedAt, "MMM d, yyyy")}</TD>
                    <TD className="font-mono text-xs">{inv.number}</TD>
                    <TD className="font-semibold">{formatNGN(toNumber(inv.amount))}</TD>
                    <TD>{inv.dueAt ? format(inv.dueAt, "MMM d, yyyy") : "—"}</TD>
                    <TD><Badge variant={invoiceStatusVariant(inv.status)}>{inv.status}</Badge></TD>
                    <TD className="text-right">
                      <Link href={invoiceTarget(inv)}><Button variant="outline" size="sm">View</Button></Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={invPage}
            totalPages={invoiceTotalPages}
            prevHref={buildHref(invPage - 1, payPage)}
            nextHref={buildHref(invPage + 1, payPage)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-6"><Empty title="No payments yet" description="Once a payment is confirmed it will appear here." /></div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Invoice</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Receipt</TH>
                </TR>
              </THead>
              <TBody>
                {payments.map((p) => (
                  <TR key={p.id}>
                    <TD>{format(p.paidAt, "MMM d, yyyy")}</TD>
                    <TD className="font-mono text-xs">{p.invoice.number}</TD>
                    <TD className="font-semibold">{formatNGN(toNumber(p.amount))}</TD>
                    <TD><Badge variant="success">PAID</Badge></TD>
                    <TD className="text-right">
                      {p.receiptKey ? (
                        <Link href={`/api/receipts/${p.invoiceId}`} target="_blank"><Button variant="outline" size="sm">Download</Button></Link>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={payPage}
            totalPages={paymentTotalPages}
            prevHref={buildHref(invPage, payPage - 1)}
            nextHref={buildHref(invPage, payPage + 1)}
          />
        </CardContent>
      </Card>
    </>
  );
}
