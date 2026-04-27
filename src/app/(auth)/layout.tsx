import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-1/2 bg-gradient-to-br from-teal-900 to-emerald-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2">
         <img src="/ctedgelogo_white.png" alt={`${company} Logo`} className="h-16 w-auto" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Secure access to your portfolio.</h2>
          <p className="mt-4 max-w-md text-teal-100">
            Track purchases, payments, documents, and investments — all in one place.
          </p>
        </div>
        <p className="text-sm text-teal-200">&copy; {new Date().getFullYear()} {company}</p>
      </aside>
      <main className="flex w-full items-center justify-center bg-white p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
