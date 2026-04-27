import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Studio",
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/studio");
  if (session.user.role !== "ADMIN") redirect("/");
  return children;
}
