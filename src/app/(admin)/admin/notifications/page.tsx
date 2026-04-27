import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BroadcastForm } from "./broadcast-form";

export default async function AdminNotificationsPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Notifications" description="Send in-app notifications, optionally with email, to customers or investors." />
      <Card>
        <CardHeader><CardTitle>Broadcast</CardTitle></CardHeader>
        <CardContent><BroadcastForm /></CardContent>
      </Card>
    </>
  );
}
