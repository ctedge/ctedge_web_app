import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/properties", label: "My Properties" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  return (
    <DashboardShell title="Customer" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
