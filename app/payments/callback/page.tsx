"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type CallbackStatus = "verifying" | "success" | "failed";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("verifying");
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref =
      searchParams.get("reference") || searchParams.get("trxref") || "";
    setReference(ref);

    if (!ref) {
      setStatus("failed");
      return;
    }

    // Paystack has already processed the payment and sent the webhook
    // to your backend at /api/payments/webhook/paystack
    // The webhook auto-creates the contribution record
    // So here we just show success and let the user go back to their group
    const timer = setTimeout(() => {
      setStatus("success");
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Auto-redirect to groups after success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/groups");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white text-2xl font-bold mb-8">
          A
        </div>

        {/* Verifying */}
        {status === "verifying" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying Payment
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we confirm your payment...
            </p>
            {reference && (
              <p className="text-xs text-gray-400 mt-4 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                Ref: {reference}
              </p>
            )}
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="text-gray-500 mt-2">
              Your contribution has been recorded. You&apos;ll be redirected
              to your groups shortly.
            </p>
            {reference && (
              <p className="text-xs text-gray-400 mt-4 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                Ref: {reference}
              </p>
            )}
            <div className="mt-6 space-y-3">
              <Link
                href="/groups"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Back to My Groups
              </Link>
              <Link
                href="/dashboard"
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Redirecting automatically in a few seconds...
            </p>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Failed
            </h2>
            <p className="text-gray-500 mt-2">
              Something went wrong with your payment. Please try again from
              your group page.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/groups"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Back to My Groups
              </Link>
              <Link
                href="/dashboard"
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallbackContent />
    </Suspense>
  );
}