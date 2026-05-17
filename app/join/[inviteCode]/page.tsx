"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI } from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function JoinGroupPage() {
  const { inviteCode } = useParams();
  const router = useRouter();
  const { isAuthenticated, user, loadFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    console.log("Join page - inviteCode:", inviteCode);
    console.log("Join page - isAuthenticated:", isAuthenticated);
    console.log("Join page - user:", user);
    
    if (inviteCode && isAuthenticated !== undefined) {
      if (isAuthenticated) {
        console.log("User is authenticated, joining group...");
        joinGroup();
      } else {
        console.log("User not authenticated, saving invite code and redirecting to login");
        // Store the invite code to redirect after login
        localStorage.setItem("pendingInviteCode", inviteCode as string);
        router.push("/login");
      }
    }
  }, [inviteCode, isAuthenticated]);

  const joinGroup = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("Calling joinViaInvite with code:", inviteCode);
      const response = await groupsAPI.joinViaInvite(inviteCode as string);
      console.log("Join response:", response);
      setGroupInfo(response.data);
      setSuccess(true);
      
      // Redirect to group page after 3 seconds
      setTimeout(() => {
        router.push(`/groups/${response.data.id}`);
      }, 3000);
      
    } catch (err: any) {
      console.error("Failed to join group:", err);
      setError(err.response?.data?.message || "Failed to join group. The invite may be expired or invalid.");
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Joining group...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Join</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success && groupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Joined!</h1>
          <p className="text-gray-600 mb-2">
            You have joined <strong>{groupInfo.name}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to group page...
          </p>
          <button
            onClick={() => router.push(`/groups/${groupInfo.id}`)}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
          >
            Go to Group Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}