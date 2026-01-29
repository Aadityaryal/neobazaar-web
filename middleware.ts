import { NextRequest, NextResponse } from "next/server";

type UserData = {
  _id?: string;
  role?: string;
};

const parseUserData = (value: string | undefined): UserData | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as UserData;
  } catch {
    try {
      return JSON.parse(value) as UserData;
    } catch {
      return null;
    }
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/user");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAdminRoute && !isUserRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;
  const userData = parseUserData(request.cookies.get("user_data")?.value);
  const isLoggedIn = Boolean(authToken && userData);

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && userData?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isDashboardRoute && userData?.role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/users";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/dashboard"],
};
