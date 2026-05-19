"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    try {
      const { confirmPassword, ...payload } = data;
      void confirmPassword;
      await authAPI.register(payload);

      const pendingInviteCode = localStorage.getItem("pendingInviteCode");
      if (pendingInviteCode) {
        localStorage.removeItem("pendingInviteCode");
        router.push(`/login?registered=true&invite=${pendingInviteCode}`);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `h-11 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm ${hasError ? "border-red-400 bg-red-50 dark:bg-red-500/10" : ""}`;

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-900">
      {/* Left panel */}
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
              Start saving<br />with your circle.
            </h2>
            <p className="text-emerald-100/80 mt-3 text-base leading-relaxed max-w-xs">
              Create your account in seconds and start building wealth together with people you trust.
            </p>
          </div>
          <ul className="space-y-3">
            {["Create or join savings groups", "Track contributions in real time", "Receive payouts automatically"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-emerald-100/50 text-xs">© 2025 Ajo Platform</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto bg-white dark:bg-zinc-900">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Ajo Platform</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">First name</Label>
                <Input id="firstName" placeholder="Soyinka" {...register("firstName")} className={inputClass(!!errors.firstName)} />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Last name</Label>
                <Input id="lastName" placeholder="Wole" {...register("lastName")} className={inputClass(!!errors.lastName)} />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className={inputClass(!!errors.email)} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Phone number</Label>
              <Input id="phoneNumber" type="tel" placeholder="08012345678" {...register("phoneNumber")} className={inputClass(!!errors.phoneNumber)} />
              {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} className={inputClass(!!errors.password) + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Confirm password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" {...register("confirmPassword")} className={inputClass(!!errors.confirmPassword) + " pr-11"} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account..." : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-7">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
