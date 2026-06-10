import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { createInvoice } from "@/server/actions/invoices";
import { redirect } from "next/navigation";
import { ToastFromQuery } from "@/components/ui/toast-from-query";
import { NewInvoiceForm } from "./_invoice-form";

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

  const [customers, landListings, housingListings, investments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.landListing.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, title: true, location: true },
      orderBy: { title: "asc" },
    }),
    prisma.housingListing.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, title: true, location: true },
      orderBy: { title: "asc" },
    }),
    prisma.investment.findMany({
      where: { status: { not: "REJECTED" } },
      include: { investor: { select: { name: true, email: true } }, project: { select: { title: true } } },
      orderBy: { investedAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <PageHeader title="New invoice" description="Issue an invoice tied to a purchase or an investment." />
      <ToastFromQuery />
      <Card>
        <CardContent className="p-6">
          <NewInvoiceForm
            customers={customers.map((c) => ({ id: c.id, label: c.name ?? c.email }))}
            landListings={landListings.map((l) => ({ id: l.id, label: `${l.title} · ${l.location}` }))}
            housingListings={housingListings.map((h) => ({ id: h.id, label: `${h.title} · ${h.location}` }))}
            investments={investments.map((i) => ({
              id: i.id,
              label: `${i.investor.name ?? i.investor.email} · ${i.project.title} · ${i.status}`,
            }))}
            defaultTarget={investmentId ? "INVESTMENT" : "PURCHASE"}
            defaultCustomerId={customerId}
            defaultInvestmentId={investmentId}
            action={createInvoiceAction}
          />
        </CardContent>
      </Card>
    </>
  );
}
