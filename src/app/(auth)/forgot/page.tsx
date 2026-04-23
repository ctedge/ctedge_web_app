"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = { ok: false };

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your email and we&apos;ll send a reset link.</p>
      {state.ok ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">{state.message}</div>
      ) : (
        <form action={action} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
      <p className="mt-6 text-sm text-slate-500"><Link href="/login" className="text-teal-700 hover:underline">Back to sign in</Link></p>
    </div>
  );
}
