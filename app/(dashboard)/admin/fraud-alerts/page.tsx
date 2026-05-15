"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminAPI } from "@/lib/api";
import { FraudAlert } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const riskColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  INVESTIGATING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  FALSE_POSITIVE: "bg-gray-100 text-gray-700",
};

export default function FraudAlertsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await adminAPI.getFraudAlerts();
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch fraud alerts", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADMIN") fetchAlerts();
  }, [user]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await adminAPI.updateFraudAlert(id, status);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? { ...alert, status: status as FraudAlert["status"] }
            : alert
        )
      );
    } catch (err) {
      console.error("Failed to update alert", err);
    } finally {
      setUpdating(null);
    }
  };

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Fraud Alerts" />

      <div className="flex-1 p-6 space-y-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Admin Panel
        </Link>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["PENDING", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"].map(
            (status) => (
              <Card key={status}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-400 capitalize">
                    {status.replace("_", " ").toLowerCase()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading
                      ? "—"
                      : alerts.filter((a) => a.status === status).length}
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              All Fraud Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-gray-400" size={28} />
                </div>
                <p className="text-gray-500 font-medium">No fraud alerts</p>
                <p className="text-gray-400 text-sm mt-1">
                  The platform is clean
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border border-gray-100 space-y-3"
                  >
                    {/* Alert Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {alert.alertType}
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskColors[alert.riskLevel]}`}
                          >
                            {alert.riskLevel}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[alert.status]}`}
                          >
                            {alert.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          User: {alert.user?.firstName} {alert.user?.lastName}{" "}
                          · {alert.user?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {alert.status === "PENDING" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                          disabled={updating === alert.id}
                          onClick={() =>
                            handleUpdateStatus(alert.id, "INVESTIGATING")
                          }
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
                          disabled={updating === alert.id}
                          onClick={() =>
                            handleUpdateStatus(alert.id, "FALSE_POSITIVE")
                          }
                        >
                          False Positive
                        </Button>
                      </div>
                    )}
                    {alert.status === "INVESTIGATING" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          disabled={updating === alert.id}
                          onClick={() =>
                            handleUpdateStatus(alert.id, "RESOLVED")
                          }
                        >
                          {updating === alert.id
                            ? "Resolving..."
                            : "Mark Resolved"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 border-gray-200 text-xs"
                          disabled={updating === alert.id}
                          onClick={() =>
                            handleUpdateStatus(alert.id, "FALSE_POSITIVE")
                          }
                        >
                          False Positive
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}