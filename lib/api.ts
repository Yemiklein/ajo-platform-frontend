import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("ajo_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ajo_token");
        localStorage.removeItem("ajo_user");
        document.cookie =
          "ajo_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authAPI = {
  register: (data: import("@/types").RegisterRequest) =>
    api.post("/api/auth/register", data),

  login: (data: import("@/types").LoginRequest) =>
    api.post("/api/auth/login", data),

  registerAdmin: (data: import("@/types").RegisterRequest, adminSecret: string) =>
    api.post("/api/auth/register-admin", data, {
      headers: { "X-Admin-Secret": adminSecret },
    }),

  forgotPassword: (identifier: string, type: string) =>
    api.post("/api/auth/forgot-password", { identifier, type }),

  verifyOtp: (identifier: string, otp: string) =>
    api.post("/api/auth/verify-otp", { identifier, otp }),
  
  resetPassword: (identifier: string, otp: string, newPassword: string) =>
    api.post("/api/auth/reset-password", { identifier, otp, newPassword }),
};

// ===== Groups =====
export const groupsAPI = {
  create: (data: import("@/types").CreateGroupRequest) =>
    api.post("/api/groups", data),
  join: (data: import("@/types").JoinGroupRequest) =>
    api.post("/api/groups/join", data),
  getMyGroups: () => api.get("/api/groups"),
  getById: (id: number) => api.get(`/api/groups/${id}`),
  
  // Invite methods
  inviteMember: (groupId: number, data: { email: string; message?: string }) =>
    api.post(`/api/groups/${groupId}/invite`, data),
  
  // Join via invite code
  joinViaInvite: (inviteCode: string) =>
    api.post(`/api/groups/join/${inviteCode}`),  // Make sure this matches your backend endpoint
  
  sendReminders: (groupId: number) =>
    api.post(`/api/groups/${groupId}/send-reminders`),
  
  getContributionSummary: (groupId: number) =>
    api.get(`/api/groups/${groupId}/contributions/summary`),
  
  getMemberContributions: (groupId: number, memberId: number) =>
    api.get(`/api/groups/${groupId}/members/${memberId}/contributions`),
};


// ===== Contributions =====
export const contributionsAPI = {
  record: (data: {
    groupId: number;
    cycleNumber: number;
    idempotencyKey: string;
  }) => api.post("/api/contributions", data),
  getByGroup: (groupId: number) =>
    api.get(`/api/contributions/group/${groupId}`),
  getByCycle: (groupId: number, cycleNumber: number) =>
    api.get(`/api/contributions/group/${groupId}/cycle/${cycleNumber}`),
  getProgress: (groupId: number, cycleNumber: number) =>
    api.get(
      `/api/contributions/group/${groupId}/cycle/${cycleNumber}/progress`
    ),
};

// ===== Payouts =====
export const payoutsAPI = {
  trigger: (groupId: number, cycleNumber: number) =>
    api.post(`/api/payouts/group/${groupId}/cycle/${cycleNumber}/trigger`),
  getSummary: (groupId: number, cycleNumber: number) =>
    api.get(`/api/payouts/group/${groupId}/cycle/${cycleNumber}/summary`),
  getByGroup: (groupId: number) => api.get(`/api/payouts/group/${groupId}`),
  getMyPayouts: () => api.get("/api/payouts/my-payouts"),
};

// ===== Payments =====
export const paymentsAPI = {
  initialize: (data: import("@/types").PaymentInitRequest) =>
    api.post("/api/payments/initialize", data),
};

// ===== Bank Account =====
export const bankAccountAPI = {
  get: () => api.get("/api/users/me/bank-account"),
  save: (data: import("@/types").BankAccount) =>
    api.post("/api/users/me/bank-account", data),
  remove: () => api.delete("/api/users/me/bank-account"),
};

// ===== Admin =====
export const adminAPI = {
  getFraudAlerts: () => api.get("/api/admin/fraud-alerts"),
  updateFraudAlert: (id: number, status: string) =>
    api.patch(`/api/admin/fraud-alerts/${id}`, { status }),
  getAllGroups: () => api.get("/api/admin/groups"),
  updateGroupStatus: (id: number, status: string) =>
    api.patch(`/api/admin/groups/${id}/status`, { status }),
};

export default api;