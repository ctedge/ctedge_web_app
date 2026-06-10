import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateInvoice } from "@/server/actions/invoices";
import { ToastFromQuery } from "@/components/ui/toast-from-query";
import { toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      purchase: { include: { customer: { select: { name: true, email: true } } } },
      investment: { include: { investor: { select: { name: true, email: true } }, project: { select: { title: true } } } },
    },
  });
  if (!invoice) notFound();
  if (invoice.status === "PAID") {
    redirect(`/admin/invoices?error=${encodeURIComponent("Paid invoices cannot be edited")}`);
  }

  async function updateInvoiceAction(formData: FormData) {
    "use server";
    const result = await updateInvoice(formData);
    if (result?.ok) redirect("/admin/invoices?saved=1");
    redirect(`/admin/invoices/${id}/edit?error=${encodeURIComponent(result?.message ?? "Could not update invoice")}`);
  }

  const who = invoice.purchase?.customer ?? invoice.investment?.investor;
  const context = invoice.target === "PURCHASE"
    ? "Property purchase"
    : `Investment · ${invoice.investment?.project.title ?? ""}`;

  return (
    <>
      <PageHeader title={`Edit ${invoice.number}`} description="Update the amount, due date, or notes. The customer will be notified." />
      <ToastFromQuery />
      <Card>
        <CardContent className="p-6">
          <form action={updateInvoiceAction} className="space-y-5">
            <input type="hidden" name="invoiceId" value={invoice.id} />

            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-mono text-xs">{invoice.number}</span>
              {" · "}{who?.name ?? who?.email ?? "—"}
              {" · "}{context}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (NGN)</label>
                <Input name="amount" type="number" step="0.01" defaultValue={toNumber(invoice.amount)} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
                <Input name="dueAt" type="date" defaultValue={invoice.dueAt ? format(invoice.dueAt, "yyyy-MM-dd") : undefined} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
              <textarea name="notes" rows={3} defaultValue={invoice.notes ?? ""} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" />
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/admin/invoices"><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
