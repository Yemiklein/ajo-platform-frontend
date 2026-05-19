// ===== Auth =====
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "USER" | "ADMIN";
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  enabled?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

// ===== Groups =====
export type CycleType = "DAILY" | "WEEKLY" | "MONTHLY";
export type GroupStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type MemberStatus = "ACTIVE" | "DEFAULTED" | "REMOVED";

export interface Group {
  id: number;
  name: string;
  description: string;
  contributionAmount: number;
  cycleType: CycleType;
  status: GroupStatus;
  maxMembers: number;
  currentMembers: number;
  createdByName: string;
  createdBy?: User;
  members?: GroupMember[];
  createdAt: string;
}

export interface GroupMember {
  id: number;
  user: User;
  payoutPosition: number;
  status: MemberStatus;
  joinedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  contributionAmount: number;
  cycleType: CycleType;
  maxMembers: number;
}

export interface JoinGroupRequest {
  groupId: number;
}

// ===== Contributions =====
export type ContributionStatus = "PENDING" | "PAID" | "FAILED";

export interface Contribution {
  id: number;
  groupId: number;
  userId: number;
  cycleNumber: number;
  amount: number;
  status: ContributionStatus;
  paymentReference: string;
  createdAt: string;
  paidAt: string;
}

export interface ContributionProgress {
  cycleNumber: number;
  totalMembers: number;
  paidCount: number;
  pendingCount: number;
  contributions: Contribution[];
}

// ===== Payouts =====
export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Payout {
  id: number;
  groupId: number;
  recipient: User;
  cycleNumber: number;
  amount: number;
  status: PayoutStatus;
  paymentReference: string;
  narration: string;
  createdAt: string;
  disbursedAt: string;
  
}

// ===== Payments =====
export interface PaymentInitRequest {
  groupId: number;
  cycleNumber: number;
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}


// ===== Bank Account =====
export interface BankAccount {
  id?: number;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
}

// ===== Admin =====
export type FraudAlertStatus =
  | "PENDING"
  | "INVESTIGATING"
  | "RESOLVED"
  | "FALSE_POSITIVE";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface FraudAlert {
  id: number;
  user: User;
  group: Group;
  alertType: string;
  riskLevel: RiskLevel;
  description: string;
  status: FraudAlertStatus;
  createdAt: string;
  resolvedAt: string;
}


