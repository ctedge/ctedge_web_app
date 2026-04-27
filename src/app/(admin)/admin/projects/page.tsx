import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { deleteProject } from "@/server/actions/projects";

export const dynamic = "force-dynamic";

async function deleteProjectAction(formData: FormData) {
  "use server";
  await deleteProject(formData);
}

export default async function AdminProjectsPage() {
  await requireRole("ADMIN");
  const [projects, investmentProjects] = await Promise.all([
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.investmentProject.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <>
      <PageHeader title="Projects" description="Portfolio projects and investment opportunities.">
        <Link href="/admin/projects/portfolio/new"><Button variant="outline">New portfolio project</Button></Link>
        <Link href="/admin/projects/investment/new"><Button>New investment project</Button></Link>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Portfolio ({projects.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No projects yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>Status</TH><TH>Location</TH><TH>Completion</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {projects.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium">{p.title}</TD>
                    <TD><Badge variant={p.status === "COMPLETED" ? "success" : p.status === "ONGOING" ? "warning" : "secondary"}>{p.status}</Badge></TD>
                    <TD>{p.location ?? "—"}</TD>
                    <TD>{p.completionDate ? p.completionDate.toDateString() : "—"}</TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/projects/portfolio/${p.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button variant="ghost" size="sm" type="submit">Delete</Button>
                      </form>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Investment projects ({investmentProjects.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {investmentProjects.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No investment projects yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>ROI</TH><TH>Duration</TH><TH>Raised</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {investmentProjects.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium">{p.title}</TD>
                    <TD>{p.roiPercent}%</TD>
                    <TD>{p.durationMonths}m</TD>
                    <TD>{formatNGN(toNumber(p.totalRaised))} / {formatNGN(toNumber(p.totalTarget))}</TD>
                    <TD><Badge variant={p.status === "OPEN" ? "success" : p.status === "MATURED" ? "secondary" : "warning"}>{p.status}</Badge></TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/projects/investment/${p.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
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
