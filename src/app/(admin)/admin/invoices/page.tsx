import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { markInvoicePaid } from "@/server/actions/invoices";
import { ProofLink } from "./proof-link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function markInvoicePaidAction(formData: FormData) {
  "use server";
  await markInvoicePaid(formData);
}

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("ADMIN");
  const { status } = await searchParams;
  const validStatus = ["UNPAID", "AWAITING_REVIEW", "PAID", "CANCELLED"] as const;
  const where = status && validStatus.includes(status as typeof validStatus[number]) ? { status: status as typeof validStatus[number] } : {};

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      payment: true,
      purchase: { include: { customer: true } },
      investment: { include: { investor: true, project: true } },
    },
    orderBy: { issuedAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader title="Invoices" description="Create invoices and confirm bank-transfer payments.">
        <Link href="/admin/invoices/new"><Button>New invoice</Button></Link>
      </PageHeader>

      <div className="mb-4 flex gap-2 text-xs">
        {[{ v: "", label: "All" }, { v: "UNPAID", label: "Unpaid" }, { v: "AWAITING_REVIEW", label: "Awaiting" }, { v: "PAID", label: "Paid" }, { v: "CANCELLED", label: "Cancelled" }].map((s) => (
          <Link key={s.v} href={s.v ? `/admin/invoices?status=${s.v}` : "/admin/invoices"} className={`rounded-full px-3 py-1 font-semibold ${status === s.v || (!status && !s.v) ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}>{s.label}</Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No invoices match.</p>
          ) : (
            <Table>
              <THead><TR><TH>Invoice</TH><TH>For</TH><TH>Amount</TH><TH>Issued</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {invoices.map((inv) => {
                  const who = inv.purchase?.customer ?? inv.investment?.investor;
                  return (
                    <TR key={inv.id}>
                      <TD className="font-mono text-xs">{inv.number}</TD>
                      <TD>
                        <div className="font-medium">{who?.name ?? who?.email ?? "—"}</div>
                        <div className="text-xs text-slate-500">{inv.target === "PURCHASE" ? "Property purchase" : `Investment · ${inv.investment?.project.title ?? ""}`}</div>
                      </TD>
                      <TD>{formatNGN(toNumber(inv.amount))}</TD>
                      <TD>{format(inv.issuedAt, "MMM d")}</TD>
                      <TD><Badge variant={inv.status === "PAID" ? "success" : inv.status === "AWAITING_REVIEW" ? "warning" : inv.status === "CANCELLED" ? "secondary" : "danger"}>{inv.status}</Badge></TD>
                      <TD className="flex items-center justify-end gap-2">
                        {inv.proofKey ? <ProofLink proofKey={inv.proofKey} /> : null}
                        {inv.status !== "PAID" && inv.status !== "CANCELLED" ? (
                          <form action={markInvoicePaidAction}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <Button size="sm" type="submit">Mark paid</Button>
                          </form>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
