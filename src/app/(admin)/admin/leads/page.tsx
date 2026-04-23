import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireRole("ADMIN");
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

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
        </CardContent>
      </Card>
    </>
  );
}
