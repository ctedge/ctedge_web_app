import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";
import { decideKyc } from "@/server/actions/kyc";
import { ProofLink } from "@/app/(admin)/admin/invoices/proof-link";

export const dynamic = "force-dynamic";

async function decideKycAction(formData: FormData) {
  "use server";
  await decideKyc(formData);
}

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

  const kyc = investor.investorProfile?.kycStatus ?? "NONE";
  const docs = investor.investorProfile?.kycDocKeys ?? [];
  const kycVariant: "success" | "warning" | "danger" | "secondary" =
    kyc === "APPROVED" ? "success" : kyc === "PENDING" ? "warning" : kyc === "REJECTED" ? "danger" : "secondary";

  return (
    <>
      <div className="mb-6 text-sm text-slate-500"><Link href="/admin/investors">← Back to investors</Link></div>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            KYC verification <Badge variant={kycVariant}>{kyc}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-slate-600">{docs.length > 0 ? `${docs.length} document${docs.length === 1 ? "" : "s"} submitted.` : "No documents submitted yet."}</p>
          {docs.length > 0 ? (
            <ol className="space-y-2">
              {docs.map((key, idx) => (
                <li key={key} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-500">Document {idx + 1}</div>
                    <div className="truncate text-xs text-slate-400">{key.split("/").pop()}</div>
                  </div>
                  <ProofLink proofKey={key} label="View document" />
                </li>
              ))}
            </ol>
          ) : null}
          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <form action={decideKycAction}>
              <input type="hidden" name="userId" value={investor.id} />
              <input type="hidden" name="decision" value="APPROVED" />
              <Button size="sm" type="submit" disabled={kyc === "APPROVED" || docs.length === 0}>Approve KYC</Button>
            </form>
            <form action={decideKycAction}>
              <input type="hidden" name="userId" value={investor.id} />
              <input type="hidden" name="decision" value="REJECTED" />
              <Button size="sm" variant="outline" type="submit" disabled={kyc === "REJECTED" || docs.length === 0}>Reject KYC</Button>
            </form>
          </div>
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
