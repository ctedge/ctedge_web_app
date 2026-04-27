import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);

  const payments = await prisma.payment.findMany({
    where: {
      invoice: {
        OR: [
          { purchase: { customerId: user.id } },
          { investment: { investorId: user.id } },
        ],
      },
    },
    include: { invoice: true },
    orderBy: { paidAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Payments" description="All confirmed payments across your purchases and investments." />
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
        </CardContent>
      </Card>
    </>
  );
}
