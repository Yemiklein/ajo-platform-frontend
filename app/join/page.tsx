"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI } from "@/lib/api";
import { Loader2, Users, ArrowRight, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const groupId = searchParams.get("id");
  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle");
  const [groupName, setGroupName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!groupId) return;
    if (isAuthenticated === false) {
      localStorage.setItem("pendingJoinId", groupId);
      router.push(`/login?redirect=/join?id=${groupId}`);
      return;
    }
    if (isAuthenticated) {
      setStatus("joining");
      groupsAPI.join({ groupId: Number(groupId) })
        .then((res) => {
          setGroupName(res.data?.name || `Group #${groupId}`);
          setStatus("success");
          setTimeout(() => router.push(`/groups/${groupId}`), 3000);
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || "This group ID is invalid or you are already a member.");
          setStatus("error");
        });
    }
  }, [groupId, isAuthenticated, router]);

  if (!groupId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
          <XCircle size={28} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Invalid link</h2>
        <p className="text-gray-500 text-sm mt-2">This invite link is missing a group ID.</p>
        <Link
          href="/groups"
          className="inline-flex items-center justify-center gap-2 mt-6 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
        >
          Browse Groups <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      {(status === "idle" || status === "joining") && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            {status === "joining"
              ? <Loader2 size={28} className="text-emerald-500 animate-spin" />
              : <Users size={28} className="text-emerald-500" />
            }
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {status === "joining" ? "Joining group..." : "You've been invited"}
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {status === "joining"
              ? "Please wait while we add you to this savings circle."
              : `You're about to join savings group #${groupId}.`}
          </p>
          {status === "idle" && (
            <button
              onClick={() => {
                setStatus("joining");
                groupsAPI.join({ groupId: Number(groupId) })
                  .then((res) => {
                    setGroupName(res.data?.name || `Group #${groupId}`);
                    setStatus("success");
                    setTimeout(() => router.push(`/groups/${groupId}`), 3000);
                  })
                  .catch((err) => {
                    setErrorMsg(err.response?.data?.message || "Failed to join this group.");
                    setStatus("error");
                  });
              }}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold mt-6 transition-all"
            >
              Join Group #{groupId} <ArrowRight size={15} />
            </button>
          )}
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">You&apos;re in!</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            You&apos;ve successfully joined <strong className="text-gray-700">{groupName}</strong>.
          </p>
          <div className="mt-6 space-y-2.5">
            <Link
              href={`/groups/${groupId}`}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
            >
              View Group <ArrowRight size={15} />
            </Link>
            <Link
              href="/groups"
              className="flex items-center justify-center w-full h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              My Groups
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Redirecting in a moment...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle size={30} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Unable to join</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{errorMsg}</p>
          <div className="mt-6 space-y-2.5">
            <Link
              href="/groups"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
            >
              Browse My Groups <ArrowRight size={15} />
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
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900">Ajo Platform</span>
        </div>
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Loader2 size={28} className="text-emerald-500 animate-spin mx-auto" />
          </div>
        }>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  );
}
