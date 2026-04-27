import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostLoginRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");
  if (role === "INVESTOR") redirect("/investor");
  redirect("/dashboard");
}
