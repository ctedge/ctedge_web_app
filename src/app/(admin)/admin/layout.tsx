import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/investors", label: "Investors" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/investments", label: "Investments" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/bookings", label: "Inspections" },
  { href: "/admin/blog", label: "Blog" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return (
    <DashboardShell title="Admin" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
