"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { handleForgotPassword } from "@/lib/actions/auth-action";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    startTransition(async () => {
      try {
        const response = await handleForgotPassword(email);
        if (!response.success) {
          setError(response.message);
          return;
        }
        setSuccess("If the email exists, a reset link has been sent");
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/20 to-primary-900/20 backdrop-blur-sm"></div>
        <div
          className="relative h-48 bg-cover bg-center"
          style={{
            backgroundImage: "url(&apos;https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&apos;)",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-dark-bg"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-sm text-gray-300">
              We&apos;ll send you a link to reset your password
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Form Card */}
      <div className="card">
        <form onSubmit={onSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center space-y-2 mt-6">
            <p className="text-sm text-gray-400">
              Remembered your password?{" "}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Back to login
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-dark-border text-center text-xs text-gray-500">
          <p>&copy; 2025 NeoBazaar · Made in Nepal</p>
          <p className="mt-1">KYC Verified Platform · Encrypted · 8,421 happy users</p>
        </div>
      </div>
    </div>
  );
}
