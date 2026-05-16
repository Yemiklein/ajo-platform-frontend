"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [type, setType] = useState<"EMAIL" | "SMS">("EMAIL");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authAPI.forgotPassword(identifier.trim(), type);
      // Pass identifier and type to next page via query params
      router.push(
        `/verify-otp?identifier=${encodeURIComponent(identifier.trim())}&type=${type}`
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
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
          <p className="text-gray-500 mt-1">Reset your password</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Choose how you want to receive your OTP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType("EMAIL");
                    setIdentifier("");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                    type === "EMAIL"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Mail size={16} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("SMS");
                    setIdentifier("");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                    type === "SMS"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Phone size={16} />
                  SMS
                </button>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1">
                <Label htmlFor="identifier">
                  {type === "EMAIL" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="identifier"
                  type={type === "EMAIL" ? "email" : "tel"}
                  placeholder={
                    type === "EMAIL" ? "you@example.com" : "08012345678"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading || !identifier.trim()}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}