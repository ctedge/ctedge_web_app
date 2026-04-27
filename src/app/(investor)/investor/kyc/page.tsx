import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KycForm } from "./kyc-form";

export const dynamic = "force-dynamic";

export default async function InvestorKycPage() {
  const user = await requireRole(["INVESTOR", "ADMIN"]);
  const profile = await prisma.investorProfile.findUnique({ where: { userId: user.id } });

  return (
    <>
      <PageHeader title="KYC & banking" description="Verify your identity and set the bank account used for disbursements." />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification status</CardTitle>
            <Badge variant={profile?.kycStatus === "APPROVED" ? "success" : profile?.kycStatus === "PENDING" ? "warning" : profile?.kycStatus === "REJECTED" ? "danger" : "secondary"}>{profile?.kycStatus ?? "NONE"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            {profile?.kycStatus === "APPROVED" ? "Your identity has been verified." :
             profile?.kycStatus === "PENDING" ? "We're reviewing your documents. This usually takes 1-2 business days." :
             profile?.kycStatus === "REJECTED" ? "We couldn't verify your documents. Please upload again or contact support." :
             "Upload a valid government-issued ID (NIN slip, international passport, or driver's licence)."}
          </p>
          <div className="mt-5">
            <KycForm
              currentBank={{
                bankName: profile?.bankName ?? "",
                bankAccount: profile?.bankAccount ?? "",
                bankAccName: profile?.bankAccName ?? "",
              }}
              uploadedCount={profile?.kycDocKeys.length ?? 0}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
