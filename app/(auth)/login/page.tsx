"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justRegistered = searchParams.get("registered") === "true";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const inviteParam = searchParams.get("invite");
    if (inviteParam) {
      localStorage.setItem("pendingInviteCode", inviteParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.login(data);
      const { token, ...userData } = response.data;
      const user = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber ?? "",
        role: userData.role ?? "USER",
        enabled: userData.enabled ?? true,
        createdAt: userData.createdAt ?? "",
      };
      setAuth(user, token);

      const pendingInviteCode = localStorage.getItem("pendingInviteCode");
      if (pendingInviteCode) {
        localStorage.removeItem("pendingInviteCode");
        router.push(`/join/${pendingInviteCode}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-900">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.15),_transparent_70%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-lg">
              A
            </div>
            <span className="text-white font-semibold text-lg">Ajo Platform</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Savings circles,<br />done right.
            </h2>
            <p className="text-emerald-100/80 mt-3 text-base leading-relaxed max-w-xs">
              Join thousands of people growing their savings together through trusted rotating pools.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-white">₦2M+</p>
              <p className="text-emerald-100/70 text-sm">Disbursed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-emerald-100/70 text-sm">Active Groups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-emerald-100/70 text-sm">On-time Payouts</p>
            </div>
          </div>
        </div>
        <p className="relative text-emerald-100/50 text-xs">© 2025 Ajo Platform</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Ajo Platform</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Sign in to continue to your account</p>
          </div>

          {justRegistered && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm mb-5">
              Account created! Sign in to continue.
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`h-11 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.email ? "border-red-400 bg-red-50 dark:bg-red-500/10" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Password</Label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-11 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all pr-11 ${errors.password ? "border-red-400 bg-red-50 dark:bg-red-500/10" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
