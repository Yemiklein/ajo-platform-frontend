"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { groupsAPI } from "@/lib/api";

interface InviteMemberModalProps {
  groupId: number;
  groupName: string;
  onClose: () => void;
}

export default function InviteMemberModal({ groupId, groupName, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await groupsAPI.inviteMember(groupId, { email, message });
      
      console.log('Invite link received:', response.data.inviteLink);
      
      // Set the invite link - this should trigger the UI to show the link section
      setInviteLink(response.data.inviteLink);
      
      // Don't call onInviteSent - let the user see the link
      
    } catch (err: any) {
      console.error("Failed to send invite:", err);
      setError(err.response?.data?.message || err.message || "Failed to send invite");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Debug: log when inviteLink changes
  console.log('Current inviteLink state:', inviteLink);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invite Members to {groupName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!inviteLink ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="friend@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Join my savings circle!"
              />
            </div>

            <button
              onClick={handleInvite}
              disabled={loading || !email}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">✓ Invite created successfully!</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this invite link with {email}:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}