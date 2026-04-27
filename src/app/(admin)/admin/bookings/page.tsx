import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/server/actions/bookings-admin";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function updateBookingStatusAction(formData: FormData) {
  "use server";
  await updateBookingStatus(formData);
}

export default async function AdminBookingsPage() {
  await requireRole("ADMIN");
  const bookings = await prisma.inspectionBooking.findMany({
    include: { land: { select: { title: true } }, housing: { select: { title: true } } },
    orderBy: { preferredDate: "asc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Inspection bookings" description="Schedule, complete, or cancel site inspections." />
      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-6"><Empty title="No bookings yet" description="New booking requests will appear here." /></div>
          ) : (
            <Table>
              <THead><TR><TH>Client</TH><TH>Listing</TH><TH>Preferred date</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {bookings.map((b) => (
                  <TR key={b.id}>
                    <TD>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.phone}{b.email ? ` · ${b.email}` : ""}</div>
                    </TD>
                    <TD>
                      <div>{b.listingType}</div>
                      <div className="text-xs text-slate-500">{b.land?.title ?? b.housing?.title ?? "—"}</div>
                    </TD>
                    <TD>{format(b.preferredDate, "MMM d, yyyy")}</TD>
                    <TD><Badge variant={b.status === "COMPLETED" ? "success" : b.status === "SCHEDULED" ? "warning" : b.status === "CANCELLED" ? "secondary" : "danger"}>{b.status}</Badge></TD>
                    <TD className="flex items-center justify-end gap-2">
                      {["SCHEDULED", "COMPLETED", "CANCELLED"].map((s) => (
                        <form key={s} action={updateBookingStatusAction}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value={s} />
                          <Button size="sm" variant={s === "COMPLETED" ? "default" : "ghost"} type="submit">{s}</Button>
                        </form>
                      ))}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
