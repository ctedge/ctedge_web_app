import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      customerProfile: true,
      purchases: { include: { invoices: { include: { payment: true }, orderBy: { issuedAt: "desc" } }, installments: { orderBy: { dueDate: "asc" } } }, orderBy: { startedAt: "desc" } },
    },
  });
  if (!customer || customer.role !== "CUSTOMER") notFound();

  return (
    <>
      <PageHeader title={customer.name ?? customer.email ?? "Customer"} description={customer.email ?? ""}>
        <Link href={`/admin/invoices/new?customerId=${customer.id}`}><Button variant="outline">Create invoice</Button></Link>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div><span className="text-slate-500">Phone:</span> {customer.phone ?? "—"}</div>
          <div><span className="text-slate-500">KYC:</span> {customer.customerProfile?.kycStatus ?? "NONE"}</div>
          <div><span className="text-slate-500">Address:</span> {customer.customerProfile?.address ?? "—"}</div>
          <div><span className="text-slate-500">Next of kin:</span> {customer.customerProfile?.nextOfKin ?? "—"}</div>
          <div><span className="text-slate-500">Joined:</span> {format(customer.createdAt, "MMM d, yyyy")}</div>
        </CardContent>
      </Card>

      {customer.purchases.map((p) => {
        const paid = p.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + toNumber(i.amount), 0);
        const total = toNumber(p.totalPrice);
        return (
          <Card key={p.id} className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.listingType} purchase · {formatNGN(total)}</CardTitle>
                <Badge variant={p.paymentMode === "INSTALLMENT" ? "warning" : "success"}>{p.paymentMode}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Paid {formatNGN(paid)} of {formatNGN(total)} · balance {formatNGN(Math.max(0, total - paid))}</p>
              {p.invoices.length > 0 ? (
                <Table className="mt-4">
                  <THead><TR><TH>Invoice</TH><TH>Amount</TH><TH>Issued</TH><TH>Status</TH></TR></THead>
                  <TBody>
                    {p.invoices.map((inv) => (
                      <TR key={inv.id}>
                        <TD className="font-mono text-xs">{inv.number}</TD>
                        <TD>{formatNGN(toNumber(inv.amount))}</TD>
                        <TD>{format(inv.issuedAt, "MMM d, yyyy")}</TD>
                        <TD><Badge variant={inv.status === "PAID" ? "success" : inv.status === "AWAITING_REVIEW" ? "warning" : "secondary"}>{inv.status}</Badge></TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
