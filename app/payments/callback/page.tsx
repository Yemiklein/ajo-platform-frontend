"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

type CallbackStatus = "verifying" | "success" | "failed";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("verifying");
  const [reference, setReference] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("trxref") || "";
    setReference(ref);
    if (!ref) { setStatus("failed"); return; }
    const timer = setTimeout(() => setStatus("success"), 2000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (status !== "success") return;
    const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    const redirect = setTimeout(() => router.push("/groups"), 5000);
    return () => { clearInterval(interval); clearTimeout(redirect); };
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900">Ajo Platform</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          {status === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <Loader2 size={28} className="text-blue-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verifying payment</h2>
              <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your transaction...</p>
              {reference && (
                <p className="text-xs text-gray-400 mt-5 font-mono bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                  Ref: {reference}
                </p>
              )}
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment successful!</h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Your contribution has been recorded. Well done for staying on track.
              </p>
              {reference && (
                <p className="text-xs text-gray-400 mt-4 font-mono bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                  Ref: {reference}
                </p>
              )}
              <div className="mt-6 space-y-2.5">
                <Link
                  href="/groups"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
                >
                  Back to My Groups <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-full h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Redirecting in {countdown}s...
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                <XCircle size={30} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment failed</h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Something went wrong. No charge was made — please try again from your group page.
              </p>
              <div className="mt-6 space-y-2.5">
                <Link
                  href="/groups"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
                >
                  Back to My Groups <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-full h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}

        </div>
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
