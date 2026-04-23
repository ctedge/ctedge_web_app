import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { InvestmentProjectForm } from "../_form";

export const dynamic = "force-dynamic";

export default async function EditInvestmentProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const project = await prisma.investmentProject.findUnique({ where: { id } });
  if (!project) notFound();
  return (
    <>
      <PageHeader title={`Edit · ${project.title}`} />
      <InvestmentProjectForm project={project} />
    </>
  );
}
