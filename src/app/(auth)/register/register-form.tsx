"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { registerAction, type AuthFormState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = { ok: false };

export function RegisterForm({ role }: { role: "CUSTOMER" | "INVESTOR" }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  const lastNotified = useRef<AuthFormState | null>(null);

  useEffect(() => {
    if (state === lastNotified.current) return;
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
    lastNotified.current = state;
  }, [state]);

  if (state.ok) {
    return (
      <div className="text-slate-700">
        <p className="text-sm">Your account has been created.</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:underline">
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" />
        {state.errors?.name ? <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required autoComplete="tel" />
          {state.errors?.phone ? <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p> : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          {state.errors?.email ? <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p> : null}
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        {state.errors?.password ? <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p> : null}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
