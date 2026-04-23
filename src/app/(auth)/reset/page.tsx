"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword, type AuthFormState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = { ok: false };

function ResetInner() {
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const email = sp.get("email") ?? "";
  const [state, action, pending] = useActionState(resetPassword, initial);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
      {state.ok ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p>{state.message}</p>
          <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:underline">Go to sign in →</Link>
        </div>
      ) : (
        <form action={action} className="mt-8 space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving…" : "Set new password"}</Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
