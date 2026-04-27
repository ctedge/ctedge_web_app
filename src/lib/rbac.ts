import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function requireRole(role: Role | Role[]) {
  const user = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role as Role)) {
    redirect("/login?error=forbidden");
  }
  return user;
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
