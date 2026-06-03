import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-4 text-8xl font-bold text-slate-200">404</div>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#011F54] px-4 text-sm font-medium text-white hover:bg-[#011F54]/90">
          Go home
        </Link>
        <Link href="/contact" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50">
          Contact us
        </Link>
      </div>
    </div>
  );
}
