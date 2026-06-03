import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminPrefix = "/admin";
const customerPrefix = "/dashboard";
const investorPrefix = "/investor";
const studioPrefix = "/studio";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPostLogin = pathname === "/post-login";
  const isAdminRoute = pathname.startsWith(adminPrefix) || pathname.startsWith(studioPrefix);
  const isCustomerRoute = pathname.startsWith(customerPrefix);
  const isInvestorRoute = pathname.startsWith(investorPrefix);

  if (!isPostLogin && !isAdminRoute && !isCustomerRoute && !isInvestorRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (!isPostLogin) url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (token as { role?: string }).role;

  if (isPostLogin) return roleRedirect(req, role);
  if (isAdminRoute && role !== "ADMIN") return roleRedirect(req, role);
  if (isInvestorRoute && role !== "INVESTOR" && role !== "ADMIN") return roleRedirect(req, role);
  if (isCustomerRoute && role !== "CUSTOMER" && role !== "ADMIN") return roleRedirect(req, role);

  return NextResponse.next();
}

function roleRedirect(req: NextRequest, role?: string) {
  const url = req.nextUrl.clone();
  url.pathname =
    role === "ADMIN" ? "/admin" : role === "INVESTOR" ? "/investor" : role === "CUSTOMER" ? "/dashboard" : "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/investor/:path*", "/studio/:path*", "/post-login"],
};
