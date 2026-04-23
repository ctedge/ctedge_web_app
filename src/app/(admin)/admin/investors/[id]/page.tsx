import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminInvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const investor = await prisma.user.findUnique({
    where: { id },
    include: {
      investorProfile: true,
      investments: { include: { project: true, disbursements: true }, orderBy: { investedAt: "desc" } },
    },
  });
  if (!investor || investor.role !== "INVESTOR") notFound();

  return (
    <>
      <PageHeader title={investor.name ?? investor.email ?? "Investor"} description={investor.email ?? ""} />

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div><span className="text-slate-500">Phone:</span> {investor.phone ?? "—"}</div>
          <div><span className="text-slate-500">KYC:</span> {investor.investorProfile?.kycStatus ?? "NONE"}</div>
          <div><span className="text-slate-500">Bank:</span> {investor.investorProfile?.bankName ?? "—"}</div>
          <div><span className="text-slate-500">Account:</span> {investor.investorProfile?.bankAccount ?? "—"} {investor.investorProfile?.bankAccName ? `(${investor.investorProfile.bankAccName})` : ""}</div>
          <div><span className="text-slate-500">Joined:</span> {format(investor.createdAt, "MMM d, yyyy")}</div>
          <div><span className="text-slate-500">KYC docs:</span> {investor.investorProfile?.kycDocKeys.length ?? 0} on file</div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Investments</CardTitle></CardHeader>
        <CardContent className="p-0">
          {investor.investments.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No investments yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Project</TH><TH>Amount</TH><TH>ROI</TH><TH>Status</TH><TH>Disbursed</TH></TR></THead>
              <TBody>
                {investor.investments.map((i) => {
                  const disbursed = i.disbursements.reduce((s, d) => s + toNumber(d.amount), 0);
                  return (
                    <TR key={i.id}>
                      <TD>{i.project.title}</TD>
                      <TD>{formatNGN(toNumber(i.amount))}</TD>
                      <TD>{i.project.roiPercent}%</TD>
                      <TD><Badge variant={i.status === "APPROVED" ? "success" : i.status === "PENDING" ? "warning" : i.status === "REJECTED" ? "danger" : "secondary"}>{i.status}</Badge></TD>
                      <TD>{formatNGN(disbursed)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
