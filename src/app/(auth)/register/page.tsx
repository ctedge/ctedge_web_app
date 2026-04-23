import Link from "next/link";
import { RegisterForm } from "@/app/(auth)/register/register-form";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const sp = await searchParams;
  const role = sp.role === "investor" ? "INVESTOR" : "CUSTOMER";
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Registering as <span className="font-semibold text-teal-700">{role === "INVESTOR" ? "an investor" : "a customer"}</span>.
      </p>
      <div className="mt-8">
        <RegisterForm role={role} />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Already have an account? <Link href="/login" className="font-medium text-teal-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
