"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const type = searchParams.get("type") || "EMAIL";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authAPI.verifyOtp(identifier, otp.trim());
      router.push(
        `/reset-password?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp.trim())}`
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await authAPI.forgotPassword(identifier, type);
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white text-2xl font-bold mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ajo Platform</h1>
          <p className="text-gray-500 mt-1">Enter your OTP</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Verify OTP</CardTitle>
            <CardDescription>
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-700">{identifier}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-1">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              {/* Resend */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-sm text-emerald-600 hover:underline font-medium"
                  >
                    {resendLoading ? "Resending..." : "Resend OTP"}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">
                    Resend OTP in{" "}
                    <span className="font-medium text-gray-600">
                      {countdown}s
                    </span>
                  </p>
                )}
              </div>
            </form>

            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={14} />
                Back
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}