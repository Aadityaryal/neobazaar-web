import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (sessionCookie) {
    redirect(AUTH_ROUTES.DASHBOARD);
  }

  return (
    <div className="page-shell flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">NeoBazaar</h1>
        <div className="flex gap-4 justify-center mt-8">
          <Link href={AUTH_ROUTES.LOGIN} className="btn-primary btn-sm px-8">Log In</Link>
          <Link href={AUTH_ROUTES.REGISTER} className="btn-secondary btn-sm px-8">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
