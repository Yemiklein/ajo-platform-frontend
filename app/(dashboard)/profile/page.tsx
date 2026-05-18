"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";
import TopBar from "@/components/shared/TopBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Shield, Eye, EyeOff, KeyRound, Calendar } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phoneNumber: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
});

const passwordSchema = z.object({
  currentEmail: z.string().email(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const inputClass = (hasError?: boolean) =>
  `h-11 rounded-xl border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 dark:text-white focus:bg-white dark:focus:bg-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm ${hasError ? "border-red-400 bg-red-50" : ""}`;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStep, setPwStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordForm | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentEmail: user?.email || "" },
  });

  const onSubmit = async (data: ProfileForm) => {
    console.log("Profile update:", data);
    toast.success("Profile updated successfully!");
    setEditMode(false);
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setEditMode(false);
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setOtpLoading(true);
    try {
      await authAPI.forgotPassword(user?.email || "", "email");
      setPendingPasswordData(data);
      setPwStep("otp");
      toast.success("OTP sent to your email address.");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || !pendingPasswordData) return;
    setOtpLoading(true);
    try {
      await authAPI.resetPassword(user?.email || "", otp, pendingPasswordData.newPassword);
      toast.success("Password changed successfully!");
      setPwMode(false);
      setPwStep("form");
      setOtp("");
      setPendingPasswordData(null);
      resetPw();
    } catch {
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const cancelPassword = () => {
    setPwMode(false);
    setPwStep("form");
    setOtp("");
    setPendingPasswordData(null);
    resetPw();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Profile" />

      <div className="flex-1 p-5 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl space-y-5">

          {/* Avatar card */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="p-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-400 dark:text-zinc-400 text-sm mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user?.role === "ADMIN"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                }`}>
                  <Shield size={11} />
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-zinc-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Account Details</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="p-6">
              {!editMode ? (
                <div className="space-y-3">
                  {[
                    { icon: User, label: "Full Name", value: `${user?.firstName} ${user?.lastName}` },
                    { icon: Mail, label: "Email Address", value: user?.email },
                    { icon: Phone, label: "Phone Number", value: user?.phoneNumber || "Not provided" },
                    { icon: Shield, label: "Account Role", value: user?.role?.toLowerCase() },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-700/50">
                      <Icon size={16} className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">First name</Label>
                      <Input id="firstName" {...register("firstName")} className={inputClass(!!errors.firstName)} />
                      {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Last name</Label>
                      <Input id="lastName" {...register("lastName")} className={inputClass(!!errors.lastName)} />
                      {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Phone number</Label>
                    <Input id="phoneNumber" {...register("phoneNumber")} className={inputClass(!!errors.phoneNumber)} />
                    {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</Label>
                    <Input value={user?.email || ""} disabled className="h-11 rounded-xl bg-gray-100 dark:bg-zinc-600 text-gray-400 dark:text-zinc-500 cursor-not-allowed border-gray-200 dark:border-zinc-600 text-sm" />
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Email cannot be changed</p>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all">
                      Save Changes
                    </button>
                    <button type="button" onClick={handleCancel} className="h-10 px-5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-zinc-700">
              <div className="flex items-center gap-2.5">
                <KeyRound size={16} className="text-gray-400 dark:text-zinc-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
              </div>
              {!pwMode && (
                <button
                  onClick={() => setPwMode(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                >
                  Change
                </button>
              )}
            </div>
            {pwMode && (
              <div className="p-6">
                {pwStep === "form" ? (
                  <form onSubmit={handleSubmitPw(onPasswordSubmit)} className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      We&apos;ll send a one-time code to <strong className="text-gray-700 dark:text-zinc-300">{user?.email}</strong> to verify your identity.
                    </p>
                    <input type="hidden" {...registerPw("currentEmail")} />
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">New password</Label>
                      <div className="relative">
                        <Input type={showNew ? "text" : "password"} {...registerPw("newPassword")} className={inputClass(!!pwErrors.newPassword) + " pr-11"} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {pwErrors.newPassword && <p className="text-red-500 text-xs">{pwErrors.newPassword.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Confirm new password</Label>
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} {...registerPw("confirmPassword")} className={inputClass(!!pwErrors.confirmPassword) + " pr-11"} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {pwErrors.confirmPassword && <p className="text-red-500 text-xs">{pwErrors.confirmPassword.message}</p>}
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" disabled={otpLoading} className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-all">
                        {otpLoading ? "Sending OTP..." : "Send Verification Code"}
                      </button>
                      <button type="button" onClick={cancelPassword} className="h-10 px-5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      Enter the 6-digit code sent to <strong className="text-gray-700 dark:text-zinc-300">{user?.email}</strong>
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Verification code</Label>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={inputClass() + " tracking-widest font-mono text-center text-lg"}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={handleOtpVerify} disabled={otpLoading || otp.length < 6} className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-all">
                        {otpLoading ? "Verifying..." : "Confirm & Change Password"}
                      </button>
                      <button onClick={cancelPassword} className="h-10 px-5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!pwMode && (
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-400 dark:text-zinc-500">
                  Use a strong, unique password to keep your account secure.
                </p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700 flex items-center gap-2.5">
              <Calendar size={16} className="text-gray-400 dark:text-zinc-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Account Info</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[
                {
                  label: "Member since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
                    : "—",
                },
                { label: "Account status", value: "Active", chip: true },
                { label: "User ID", value: `#${user?.id}`, mono: true },
              ].map(({ label, value, chip, mono }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-zinc-700 last:border-0">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{label}</p>
                  {chip ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {value}
                    </span>
                  ) : (
                    <p className={`text-sm font-medium text-gray-900 dark:text-white ${mono ? "font-mono text-gray-400 dark:text-zinc-500" : ""}`}>
                      {value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
