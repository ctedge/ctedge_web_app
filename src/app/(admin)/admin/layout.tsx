import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  LayoutDashboard,
  Tag,
  Briefcase,
  Users,
  UserCheck,
  Receipt,
  TrendingUp,
  FileText,
  Bell,
  BarChart3,
  Inbox,
  CalendarCheck,
  Newspaper,
  Settings,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { href: "/admin/listings", label: "Listings", icon: <Tag size={16} /> },
  { href: "/admin/projects", label: "Projects", icon: <Briefcase size={16} /> },
  { href: "/admin/customers", label: "Customers", icon: <Users size={16} /> },
  { href: "/admin/investors", label: "Investors", icon: <UserCheck size={16} /> },
  { href: "/admin/invoices", label: "Invoices", icon: <Receipt size={16} /> },
  { href: "/admin/investments", label: "Investments", icon: <TrendingUp size={16} /> },
  { href: "/admin/documents", label: "Documents", icon: <FileText size={16} /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 size={16} /> },
  { href: "/admin/leads", label: "Leads", icon: <Inbox size={16} /> },
  { href: "/admin/bookings", label: "Inspections", icon: <CalendarCheck size={16} /> },
  { href: "/admin/blog", label: "Blog", icon: <Newspaper size={16} /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings size={16} /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return (
    <DashboardShell title="Admin" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
