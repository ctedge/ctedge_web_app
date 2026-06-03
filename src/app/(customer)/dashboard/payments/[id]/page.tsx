import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";
import { TicketPaidForm } from "@/components/payments/ticket-paid-form";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { purchase: true, payment: true },
  });
  if (!invoice || !invoice.purchase) notFound();
  if (invoice.purchase.customerId !== user.id && user.role !== "ADMIN") notFound();

  const statusVariant: "success" | "warning" | "danger" | "secondary" =
    invoice.status === "PAID" ? "success" : invoice.status === "AWAITING_REVIEW" ? "warning" : invoice.status === "CANCELLED" ? "secondary" : "danger";

  return (
    <>
      <div className="mb-6 text-sm text-slate-500"><Link href="/dashboard/payments">← Back to payments</Link></div>
      <PageHeader title={`Ticket ${invoice.number}`} description={`Opened ${format(invoice.issuedAt, "MMM d, yyyy")}`}>
        <Badge variant={statusVariant}>{invoice.status}</Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Ticket details</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div><span className="text-slate-500">Amount:</span> <strong>{formatNGN(toNumber(invoice.amount))}</strong></div>
              {invoice.dueAt ? <div><span className="text-slate-500">Due:</span> {format(invoice.dueAt, "MMM d, yyyy")}</div> : null}
              {invoice.notes ? <div><span className="text-slate-500">Notes:</span> {invoice.notes}</div> : null}
            </CardContent>
          </Card>

          {invoice.status === "PAID" ? (
            <Card>
              <CardHeader><CardTitle>Payment confirmed</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600">
                Admin has approved your payment. You can download the receipt from <Link href="/dashboard/payments" className="font-semibold text-teal-700 hover:underline">your payments page</Link>.
              </CardContent>
            </Card>
          ) : invoice.status === "AWAITING_REVIEW" ? (
            <Card>
              <CardHeader><CardTitle>Awaiting approval</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600">
                Your proof has been received. Admin is reviewing and will approve shortly.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Confirm your payment</CardTitle></CardHeader>
              <CardContent>
                <TicketPaidForm invoiceId={invoice.id} initialProofKey={invoice.proofKey} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Bank transfer details</CardTitle></CardHeader>
            <CardContent className="grid gap-1 text-sm text-slate-700">
              <div><span className="text-slate-500">Bank:</span> {process.env.NEXT_PUBLIC_BANK_NAME}</div>
              <div><span className="text-slate-500">Account name:</span> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME}</div>
              <div><span className="text-slate-500">Account number:</span> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER}</div>
              <div className="mt-2"><span className="text-slate-500">Reference:</span> <strong>{invoice.number}</strong></div>
              <p className="mt-2 text-xs text-slate-500">Use the reference above on your transfer so admin can match it to this ticket.</p>
            </CardContent>
          </Card>

          {invoice.status === "UNPAID" || invoice.status === "AWAITING_REVIEW" ? (
            <Link href={`/dashboard/properties/${invoice.purchase.id}`}>
              <Button variant="outline" className="w-full">Open property</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
