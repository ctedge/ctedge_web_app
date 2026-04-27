import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { formatNGN, toNumber } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { decideKyc } from "@/server/actions/kyc";

export const dynamic = "force-dynamic";

async function decideKycAction(formData: FormData) {
  "use server";
  await decideKyc(formData);
}

export default async function AdminInvestorsPage() {
  await requireRole("ADMIN");
  const investors = await prisma.user.findMany({
    where: { role: "INVESTOR" },
    include: {
      investorProfile: true,
      investments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Investors" description="Review investor profiles, KYC, and holdings." />
      <Card>
        <CardContent className="p-0">
          {investors.length === 0 ? (
            <div className="p-6"><Empty title="No investors yet" description="Once users register as investors they'll show here." /></div>
          ) : (
            <Table>
              <THead><TR><TH>Investor</TH><TH>Phone</TH><TH>KYC</TH><TH>Holdings</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {investors.map((inv) => {
                  const total = inv.investments.filter((i) => i.status === "APPROVED" || i.status === "MATURED").reduce((s, i) => s + toNumber(i.amount), 0);
                  const kyc = inv.investorProfile?.kycStatus ?? "NONE";
                  return (
                    <TR key={inv.id}>
                      <TD>
                        <div className="font-medium">{inv.name ?? "—"}</div>
                        <div className="text-xs text-slate-500">{inv.email}</div>
                      </TD>
                      <TD>{inv.phone ?? "—"}</TD>
                      <TD><Badge variant={kyc === "APPROVED" ? "success" : kyc === "PENDING" ? "warning" : kyc === "REJECTED" ? "danger" : "secondary"}>{kyc}</Badge></TD>
                      <TD>{formatNGN(total)}</TD>
                      <TD className="flex items-center justify-end gap-2">
                        {kyc === "PENDING" ? (
                          <>
                            <form action={decideKycAction}>
                              <input type="hidden" name="userId" value={inv.id} />
                              <input type="hidden" name="decision" value="APPROVED" />
                              <Button size="sm" variant="outline" type="submit">Approve</Button>
                            </form>
                            <form action={decideKycAction}>
                              <input type="hidden" name="userId" value={inv.id} />
                              <input type="hidden" name="decision" value="REJECTED" />
                              <Button size="sm" variant="ghost" type="submit">Reject</Button>
                            </form>
                          </>
                        ) : (
                          <Link href={`/admin/investors/${inv.id}`} className="text-sm font-semibold text-teal-700 hover:underline">Open</Link>
                        )}
                      </TD>
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
