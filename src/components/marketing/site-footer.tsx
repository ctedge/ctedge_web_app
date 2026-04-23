import Image from "next/image";
import Link from "next/link";

const cols = [
  {
    title: "CT Edge",
    links: [
      { href: "/about", label: "About" },
      { href: "/why-choose-us", label: "Why choose us" },
      { href: "/projects", label: "Projects" },
      { href: "/blog", label: "Insights" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Offerings",
    links: [
      { href: "/land", label: "Buy Land" },
      { href: "/housing", label: "Housing" },
      { href: "/services", label: "Construction" },
      { href: "/investments", label: "Invest" },
    ],
  },
  {
    title: "Campaigns",
    links: [
      { href: "/buy-land", label: "Buy Land" },
      { href: "/invest", label: "Real Estate Invest" },
      { href: "/construction", label: "Construction" },
    ],
  },
];

export function SiteFooter({ company, address, phone, email }: { company: string; address: string; phone: string; email: string }) {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="text-xl font-semibold text-white">
              <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/ctedgelogo_white.png"
                        alt={`${company} logo`}
                        width={160}
                        height={48}
                        priority
                        className="h-10 w-auto sm:h-12"
                      />
                    </Link>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Real estate, construction, and investment solutions built on trust, quality, and long-term returns.
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>{address}</p>
            <p>{phone}</p>
            <p>{email}</p>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-white">{c.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} {company}. All rights reserved.
      </div>
    </footer>
  );
}
