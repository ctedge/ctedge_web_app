import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { decideInvestment } from "@/server/actions/investments";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function decideInvestmentAction(formData: FormData) {
  "use server";
  await decideInvestment(formData);
}

export default async function AdminInvestmentsPage() {
  await requireRole("ADMIN");
  const investments = await prisma.investment.findMany({
    include: { investor: true, project: true, disbursements: true },
    orderBy: { investedAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Investments" description="Approve investor commitments and record disbursements." />
      <Card>
        <CardContent className="p-0">
          {investments.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No investments yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Investor</TH><TH>Project</TH><TH>Amount</TH><TH>Status</TH><TH>Invested</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {investments.map((i) => (
                  <TR key={i.id}>
                    <TD>
                      <div className="font-medium">{i.investor.name ?? i.investor.email}</div>
                      <div className="text-xs text-slate-500">{i.investor.phone ?? ""}</div>
                    </TD>
                    <TD>{i.project.title}</TD>
                    <TD>{formatNGN(toNumber(i.amount))}</TD>
                    <TD><Badge variant={i.status === "APPROVED" ? "success" : i.status === "PENDING" ? "warning" : i.status === "REJECTED" ? "danger" : "secondary"}>{i.status}</Badge></TD>
                    <TD>{format(i.investedAt, "MMM d, yyyy")}</TD>
                    <TD className="flex items-center justify-end gap-2">
                      {i.status === "PENDING" ? (
                        <>
                          <form action={decideInvestmentAction}>
                            <input type="hidden" name="investmentId" value={i.id} />
                            <input type="hidden" name="decision" value="APPROVED" />
                            <Button size="sm" type="submit">Approve</Button>
                          </form>
                          <form action={decideInvestmentAction}>
                            <input type="hidden" name="investmentId" value={i.id} />
                            <input type="hidden" name="decision" value="REJECTED" />
                            <Button size="sm" variant="ghost" type="submit">Reject</Button>
                          </form>
                        </>
                      ) : null}
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
