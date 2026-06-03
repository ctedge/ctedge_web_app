import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LayoutDashboard, Home, CreditCard, FileText, Bell } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { href: "/dashboard/properties", label: "My Properties", icon: <Home size={16} /> },
  { href: "/dashboard/payments", label: "Payments", icon: <CreditCard size={16} /> },
  { href: "/dashboard/documents", label: "Documents", icon: <FileText size={16} /> },
  { href: "/dashboard/notifications", label: "Notifications", icon: <Bell size={16} /> },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  return (
    <DashboardShell title="Customer" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
