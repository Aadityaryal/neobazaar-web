"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoginFormData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-action";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const submit = async (values: LoginFormData) => {
    setError(null);

    setTransition(async () => {
      try {
        const response = await handleLogin(values);
        if (!response.success) {
          throw new Error(response.message);
        }
        if (response.success) {
          router.push("/dashboard");
        } else {
          setError('Login failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    });
    console.log("login", values);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/20 to-primary-900/20 backdrop-blur-sm"></div>
        <div
          className="relative h-48 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-dark-bg"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome to NeoBazaar
            </h1>
            <p className="text-sm text-gray-300">
              Nepal&apos;s first AI-powered trusted marketplace · Buy · Rent · Auction · Exchange
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {/* Email or Phone Input */}
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-300 mb-2">
              Email or Phone
            </label>
            <input
              id="emailOrPhone"
              type="text"
              placeholder="Enter your email or phone number"
              {...register("emailOrPhone")}
              className="input-field"
            />
            {errors.emailOrPhone && (
              <p className="mt-1 text-sm text-red-400">{errors.emailOrPhone.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || pending ? "Logging in..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-card text-gray-400">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>

            <button
              type="button"
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Continue with Phone OTP
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2 mt-6">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create account
              </Link>
            </p>
            <Link href="/forgot-password" className="block text-sm text-primary-400 hover:text-primary-300">
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-dark-border text-center text-xs text-gray-500">
          <p>© 2025 NeoBazaar · Made in Nepal</p>
          <p className="mt-1">KYC Verified Platform · Encrypted · 8,421 happy users</p>
        </div>
      </div>
    </div>
  );
}