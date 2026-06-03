import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LayoutDashboard, Briefcase, TrendingUp, FileText, ShieldCheck, Bell } from "lucide-react";

const nav = [
  { href: "/investor", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { href: "/investor/projects", label: "Projects", icon: <Briefcase size={16} /> },
  { href: "/investor/my-investments", label: "My Investments", icon: <TrendingUp size={16} /> },
  { href: "/investor/documents", label: "Documents", icon: <FileText size={16} /> },
  { href: "/investor/kyc", label: "KYC", icon: <ShieldCheck size={16} /> },
  { href: "/investor/notifications", label: "Notifications", icon: <Bell size={16} /> },
];

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["INVESTOR", "ADMIN"]);
  return (
    <DashboardShell title="Investor" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
