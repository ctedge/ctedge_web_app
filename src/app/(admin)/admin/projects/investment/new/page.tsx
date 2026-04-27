import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { InvestmentProjectForm } from "../_form";

export default async function NewInvestmentProjectPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New investment project" />
      <InvestmentProjectForm />
    </>
  );
}
