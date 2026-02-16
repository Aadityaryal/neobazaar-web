import Link from "next/link";
import Image from "next/image";
import { cookies, headers } from "next/headers";
import { getUserData } from "@/lib/cookie";
import PreferenceToggles from "@/app/_components/PreferenceToggles";
import HeaderNav from "./HeaderNav";
import { navByRole, type NavRole } from "@/lib/navigation";
import { deriveEffectiveNavRole, deriveNavRole } from "@/lib/auth/role";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import LogoutForm from "./LogoutForm";

export default async function Header() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const backendSessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const currentPath = headerStore.get("x-current-path") || "/";
  const userData = await getUserData();
  const isLoggedIn = Boolean(backendSessionCookie && userData?.userId);
  const role: NavRole = deriveNavRole(isLoggedIn, userData);
  const effectiveRole: NavRole = deriveEffectiveNavRole(role, currentPath);
  const primaryNav = navByRole[effectiveRole];

  return (
    <header className="header-shell sticky top-0 z-50 w-full">
      <div className="page-container">
        <div className="my-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-primary-700 text-xs font-black text-white">
                NB
              </span>
              <Image
                src="/images/NeoBazaar_Logo.png"
                alt="NeoBazaar"
                width={20}
                height={20}
                className="h-5 w-5 opacity-80"
              />

              <span className="neo-heading text-xl font-extrabold leading-none text-white">
                NeoBazaar
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <PreferenceToggles />            </div>
          </div>

          <HeaderNav
            isLoggedIn={isLoggedIn}
            neoTokens={userData?.neoTokens ?? 0}
            role={effectiveRole}
            primaryNav={primaryNav}
            onLogout={<LogoutForm />}
          />
        </div>
      </div>
    </header>
  );
}
