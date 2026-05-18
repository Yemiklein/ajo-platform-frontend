"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI } from "@/lib/api";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function JoinGroupPage() {
  const { inviteCode } = useParams();
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [status, setStatus] = useState<"joining" | "success" | "error">("joining");
  const [errorMsg, setErrorMsg] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!inviteCode) return;

    if (isAuthenticated === false) {
      localStorage.setItem("pendingInviteCode", inviteCode as string);
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      groupsAPI.joinViaInvite(inviteCode as string)
        .then((res) => {
          setGroupName(res.data.name);
          setGroupId(res.data.id);
          setStatus("success");
          setTimeout(() => router.push(`/groups/${res.data.id}`), 3000);
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || "This invite link is invalid or has expired.");
          setStatus("error");
        });
    }
  }, [inviteCode, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900">Ajo Platform</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          {status === "joining" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <Loader2 size={28} className="text-blue-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Joining group</h2>
              <p className="text-gray-500 text-sm mt-2">Please wait while we add you to this savings circle...</p>
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
                {groupId && (
                  <Link
                    href={`/groups/${groupId}`}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
                  >
                    View Group <ArrowRight size={15} />
                  </Link>
                )}
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
      </div>
    </div>
  );
}
