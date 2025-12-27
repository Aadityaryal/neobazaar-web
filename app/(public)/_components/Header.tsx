import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b border-dark-border bg-dark-bg/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/NeoBazaar_Logo.png"
              alt="NeoBazaar"
              width={32}
              height={32}
              className="w-8 h-8"
            />

            <span className="text-xl font-bold bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent leading-none">
              NeoBazaar
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <button className="px-4 sm:px-6 py-2 text-sm font-medium text-white hover:text-primary-400 transition-colors">
                Log In
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 sm:px-6 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
