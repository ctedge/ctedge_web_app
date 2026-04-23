import Link from "next/link";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { markAllNotificationsRead, markNotificationRead } from "@/server/actions/notifications";

export const dynamic = "force-dynamic";

async function markAllAction() {
  "use server";
  await markAllNotificationsRead();
}

async function markOneAction(formData: FormData) {
  "use server";
  await markNotificationRead(formData);
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unread = notifications.filter((n) => n.readAt === null).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up."}
      >
        {unread > 0 ? (
          <form action={markAllAction}>
            <Button variant="outline" size="sm">Mark all read</Button>
          </form>
        ) : null}
      </PageHeader>
      {notifications.length === 0 ? (
        <Empty title="No notifications" description="We'll let you know when there's something new." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.readAt ? "" : "border-teal-200 bg-teal-50/30"}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={n.readAt ? "secondary" : "warning"}>{n.type}</Badge>
                    {!n.readAt ? <span className="text-xs font-semibold text-teal-700">NEW</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">{n.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{format(n.createdAt, "MMM d, yyyy · h:mm a")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {n.url ? (
                    <Link href={n.url}><Button variant="outline" size="sm">Open</Button></Link>
                  ) : null}
                  {!n.readAt ? (
                    <form action={markOneAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <Button variant="ghost" size="sm">Mark read</Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
