import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { PortfolioProjectForm } from "../_form";

export default async function NewProjectPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New portfolio project" />
      <PortfolioProjectForm />
    </>
  );
}
