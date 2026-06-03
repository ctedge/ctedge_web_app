import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { format } from "date-fns";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireRole("ADMIN");
  const { page: rawPage } = await searchParams;
  const total = await prisma.lead.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <PageHeader title="Leads" description="All lead submissions from marketing forms and landing pages." />
      <Card>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="p-6"><Empty title="No leads yet" description="Lead submissions will appear here as they come in." /></div>
          ) : (
            <Table>
              <THead><TR><TH>Name</TH><TH>Phone</TH><TH>Email</TH><TH>Interest</TH><TH>Source</TH><TH>Received</TH></TR></THead>
              <TBody>
                {leads.map((l) => (
                  <TR key={l.id}>
                    <TD className="font-medium">{l.name}</TD>
                    <TD>{l.phone}</TD>
                    <TD>{l.email ?? "—"}</TD>
                    <TD>{l.interest ?? "—"}</TD>
                    <TD>{l.source ?? "—"}</TD>
                    <TD>{format(l.createdAt, "MMM d, h:mm a")}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            prevHref={buildPageHref("/admin/leads", { page: page - 1 })}
            nextHref={buildPageHref("/admin/leads", { page: page + 1 })}
          />
        </CardContent>
      </Card>
    </>
  );
}
