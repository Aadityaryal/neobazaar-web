import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          NeoBazaar
        </h1>
        <p className="text-2xl text-gray-300">
          Nepal&apos;s First AI-Powered Trusted Marketplace
        </p>
        <p className="text-lg text-gray-400 max-w-2xl">
          Buy · Rent · Auction · Exchange
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <button className="btn-primary px-8">
              Log In
            </button>
          </Link>
          <Link href="/register">
            <button className="btn-secondary px-8">
              Sign Up
            </button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          © 2025 NeoBazaar · Made in Nepal
        </p>
      </div>
    </div>
  );
}