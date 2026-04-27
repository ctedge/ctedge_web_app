import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const nav = [
  { href: "/investor", label: "Overview" },
  { href: "/investor/projects", label: "Projects" },
  { href: "/investor/my-investments", label: "My Investments" },
  { href: "/investor/documents", label: "Documents" },
  { href: "/investor/kyc", label: "KYC" },
  { href: "/investor/notifications", label: "Notifications" },
];

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["INVESTOR", "ADMIN"]);
  return (
    <DashboardShell title="Investor" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
