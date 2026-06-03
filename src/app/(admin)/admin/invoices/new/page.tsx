import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createInvoice } from "@/server/actions/invoices";
import { redirect } from "next/navigation";
import { ToastFromQuery } from "@/components/ui/toast-from-query";

export const dynamic = "force-dynamic";

async function createInvoiceAction(formData: FormData) {
  "use server";
  const result = await createInvoice(formData);
  if (result?.ok) redirect(`/admin/invoices?created=${result.id}`);
  redirect(`/admin/invoices/new?error=${encodeURIComponent(result?.message ?? "Could not create invoice")}`);
}

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ customerId?: string; investmentId?: string }> }) {
  await requireRole("ADMIN");
  const { customerId, investmentId } = await searchParams;

  const [purchases, investments] = await Promise.all([
    customerId
      ? prisma.purchase.findMany({ where: { customerId }, include: { customer: true }, orderBy: { startedAt: "desc" } })
      : prisma.purchase.findMany({ include: { customer: true }, orderBy: { startedAt: "desc" }, take: 50 }),
    investmentId
      ? prisma.investment.findMany({ where: { id: investmentId }, include: { investor: true, project: true } })
      : prisma.investment.findMany({ where: { status: "APPROVED" }, include: { investor: true, project: true }, orderBy: { investedAt: "desc" }, take: 50 }),
  ]);

  return (
    <>
      <PageHeader title="New invoice" description="Issue an invoice tied to a purchase or an investment." />
      <ToastFromQuery />
      <Card>
        <CardContent className="p-6">
          <form action={createInvoiceAction} className="space-y-5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Target</label>
              <select name="target" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" required>
                <option value="PURCHASE">Property purchase</option>
                <option value="INVESTMENT">Investment</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Purchase</label>
              <select name="purchaseId" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                <option value="">— none —</option>
                {purchases.map((p) => (
                  <option key={p.id} value={p.id}>{p.customer.name ?? p.customer.email} · {p.listingType} · {p.id.slice(0, 6)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Investment</label>
              <select name="investmentId" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                <option value="">— none —</option>
                {investments.map((i) => (
                  <option key={i.id} value={i.id}>{i.investor.name ?? i.investor.email} · {i.project.title}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (NGN)</label>
                <Input name="amount" type="number" step="0.01" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
                <Input name="dueAt" type="date" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
              <textarea name="notes" rows={3} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Create invoice</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
