import Link from "next/link";
import { LoginForm } from "@/app/(auth)/login/login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to your account.</p>
      <div className="mt-8">
        <LoginForm callbackUrl={sp.callbackUrl} initialError={sp.error === "forbidden" ? "You don't have access to that page." : undefined} />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        New here? <Link href="/register" className="font-medium text-teal-700 hover:underline">Create an account</Link>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        <Link href="/forgot" className="text-teal-700 hover:underline">Forgot password?</Link>
      </p>
    </div>
  );
}
