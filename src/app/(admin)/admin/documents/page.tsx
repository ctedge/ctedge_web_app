import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDocument } from "@/server/actions/documents";
import { AssignDocumentForm } from "./assign-form";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function deleteDocumentAction(formData: FormData) {
  "use server";
  await deleteDocument(formData);
}

export default async function AdminDocumentsPage() {
  await requireRole("ADMIN");
  const [documents, users] = await Promise.all([
    prisma.document.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.user.findMany({ where: { role: { in: ["CUSTOMER", "INVESTOR"] } }, select: { id: true, name: true, email: true, role: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Documents" description="Upload and assign documents to specific users." />

      <Card className="mb-6">
        <CardHeader><CardTitle>Assign document</CardTitle></CardHeader>
        <CardContent>
          <AssignDocumentForm users={users} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No documents yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>Owner</TH><TH>Kind</TH><TH>Added</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {documents.map((d) => (
                  <TR key={d.id}>
                    <TD className="font-medium">{d.title}</TD>
                    <TD>
                      <div>{d.owner.name ?? d.owner.email}</div>
                      <div className="text-xs text-slate-500">{d.owner.role}</div>
                    </TD>
                    <TD><Badge variant="secondary">{d.kind}</Badge></TD>
                    <TD>{format(d.createdAt, "MMM d, yyyy")}</TD>
                    <TD className="text-right">
                      <form action={deleteDocumentAction}>
                        <input type="hidden" name="id" value={d.id} />
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
    </>
  );
}
