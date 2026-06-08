import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { HeaderNav, type HeaderNavItem } from "@/components/marketing/header-nav";
import { UserMenu, type UserMenuUser } from "@/components/marketing/user-menu";
import { signOutAction } from "@/server/actions/auth";

const nav: HeaderNavItem[] = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/why-choose-us", label: "Why us" },
  { href: "/services", label: "Services" },
  { href: "/land", label: "Land" },
  { href: "/housing", label: "Housing" },
  { href: "/projects", label: "Projects" },
  { href: "/investments", label: "Invest" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function dashboardHrefFor(role: string | undefined) {
  if (role === "ADMIN") return "/admin";
  if (role === "INVESTOR") return "/investor";
  return "/dashboard";
}

export async function SiteHeader({ company }: { company: string }) {
  const session = await auth();
  const user = session?.user;

  const authSlot = user ? (
    <UserMenu
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        dashboardHref: dashboardHrefFor(user.role),
      } satisfies UserMenuUser}
    />
  ) : (
    <>
      <Link href="/login">
        <Button variant="ghost" size="sm">Log in</Button>
      </Link>
      <Link href="/register">
        <Button size="sm">Get started</Button>
      </Link>
    </>
  );

  const mobileAuthSlot = user ? (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user.name ?? user.email}</span>
      </div>
      <Link href={dashboardHrefFor(user.role)} className="w-full">
        <Button className="w-full" size="sm">Go to dashboard</Button>
      </Link>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <Link href="/login" className="w-full">
        <Button variant="outline" size="sm" className="w-full">Log in</Button>
      </Link>
      <Link href="/register" className="w-full">
        <Button size="sm" className="w-full">Get started</Button>
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur animate-slide-down">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-smooth hover:scale-110">
          <Image
            src="/ctedgelogo.png"
            alt={`${company} logo`}
            width={160}
            height={48}
            priority
            style={{ width: "auto" }}
            className="h-10 w-auto sm:h-12"
          />
        </Link>
        <HeaderNav items={nav} authSlot={authSlot} mobileAuthSlot={mobileAuthSlot} />
      </div>
    </header>
  );
}
