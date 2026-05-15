"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Admin Panel" />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <ShieldAlert className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-gray-400 text-sm">
              Manage platform activity and fraud alerts
            </p>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/fraud-alerts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="text-red-500" size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Fraud Alerts
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      Review and manage fraud alerts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/groups">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="text-purple-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Groups
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      View and manage all platform groups
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}