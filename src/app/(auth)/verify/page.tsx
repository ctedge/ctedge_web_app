import Link from "next/link";
import { verifyEmailAction } from "@/server/actions/auth";

export const metadata = { title: "Verify email" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string }> }) {
  const sp = await searchParams;
  const token = sp.token;
  const email = sp.email;
  let result: { ok: boolean; message: string } | null = null;
  if (token && email) result = await verifyEmailAction(email, token);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Verify email</h1>
      {!token || !email ? (
        <p className="mt-4 text-sm text-slate-500">Missing verification details. Please use the link in your email.</p>
      ) : result?.ok ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p>{result.message}</p>
          <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:underline">Go to sign in →</Link>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p>{result?.message ?? "Unable to verify email."}</p>
        </div>
      )}
    </div>
  );
}
