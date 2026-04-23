import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { DocumentDownload } from "./document-download";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  const documents = await prisma.document.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Documents" description="Allocation letters, receipts, and any other documents assigned to you." />
      {documents.length === 0 ? (
        <Empty title="No documents yet" description="Your documents will appear here once uploaded by our admin team." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Badge variant="secondary">{d.kind}</Badge>
                  <h3 className="mt-2 font-semibold text-slate-900">{d.title}</h3>
                  <p className="text-xs text-slate-500">Added {format(d.createdAt, "MMM d, yyyy")}</p>
                </div>
                <DocumentDownload documentId={d.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
