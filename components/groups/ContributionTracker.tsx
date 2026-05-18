"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { groupsAPI } from "@/lib/api";

interface ContributionTrackerProps {
  groupId: number;
}

export default function ContributionTracker({ groupId }: ContributionTrackerProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [groupId]);

  const fetchSummary = async () => {
    try {
      const response = await groupsAPI.getContributionSummary(groupId);
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch contribution summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-4 bg-gray-100 rounded-lg">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold">{summary.collectionRate}%</p>
            </div>
            <TrendingUp className="text-emerald-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expected</p>
              <p className="text-2xl font-bold">₦{summary.totalExpectedAmount?.toLocaleString()}</p>
            </div>
            {/* <DollarSign className="text-blue-500" size={32} /> */}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold">₦{summary.totalReceivedAmount?.toLocaleString()}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold">{summary.totalMembers}</p>
            </div>
            <Users className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Member Contributions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Member Contributions</h3>
          <p className="text-sm text-gray-500">Cycle #{summary.currentCycle}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Contributed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycles Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.memberContributions?.map((member: any) => (
                <tr key={member.userId}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{member.userFullName}</p>
                      <p className="text-sm text-gray-500">{member.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">₦{member.totalContributed?.toLocaleString()}</td>
                  <td className="px-6 py-4">{member.cyclesPaid} / {member.cyclesPaid + member.cyclesMissed}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.contributionStatus === "UP_TO_DATE" ? "bg-green-100 text-green-800" :
                      member.contributionStatus === "BEHIND" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {member.contributionStatus?.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}