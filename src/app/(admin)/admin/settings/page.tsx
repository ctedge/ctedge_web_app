import { redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getCompanySettings } from "@/lib/company-settings";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCompanySettings } from "@/server/actions/settings";
import { ToastFromQuery } from "@/components/ui/toast-from-query";

export const dynamic = "force-dynamic";

async function updateSettingsAction(formData: FormData) {
  "use server";
  const result = await updateCompanySettings(formData);
  if (result?.ok) redirect("/admin/settings?saved=1");
  redirect(`/admin/settings?error=${encodeURIComponent(result?.message ?? "Could not save")}`);
}

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const settings = await getCompanySettings();

  return (
    <>
      <PageHeader title="Settings" description="Company contact details shown on the public website, footer, and contact page." />
      <ToastFromQuery messages={{ saved: "Settings saved." }} />

      <Card>
        <CardContent className="p-6">
          <form action={updateSettingsAction} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Company name</label>
              <Input name="name" defaultValue={settings.name} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Address</label>
              <Input name="address" defaultValue={settings.address} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
              <Input name="phone" defaultValue={settings.phone} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
              <Input name="email" type="email" defaultValue={settings.email} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">WhatsApp number</label>
              <Input name="whatsapp" defaultValue={settings.whatsapp} required />
              <p className="mt-1 text-xs text-slate-500">Use international format without `+`, e.g. <code>2348012345678</code>.</p>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
