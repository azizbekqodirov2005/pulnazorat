const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || "So'rovda xatolik yuz berdi");
  }

  return data as T;
}

export interface User {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  currency: string;
  language: string;
  plan: "free" | "pro";
  referralCode: string;
  role: "user" | "admin";
  proUnlockedVia: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (input: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(input) }),
  login: (input: { emailOrPhone: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) }),
  me: (token: string) => request<User>("/auth/me", { token }),
  updateProfile: (token: string, fullName: string) =>
    request<User>("/auth/me", { method: "PATCH", body: JSON.stringify({ fullName }), token }),
  forgotPassword: (email: string) =>
    request<{ ok: true }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    }),
};

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  isSystem: boolean;
}

export const categoriesApi = {
  list: (token: string) => request<Category[]>("/categories", { token }),
};

export interface Transaction {
  id: string;
  categoryId: string;
  type: "income" | "expense";
  amount: number;
  note: string | null;
  occurredOn: string;
  createdAt: string;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Summary {
  month: string;
  income: number;
  expense: number;
  balance: number;
  byCategory: { categoryId: string; name: string; total: number }[];
}

export const transactionsApi = {
  list: (token: string, params: { page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    return request<TransactionList>(`/transactions?${qs.toString()}`, { token });
  },
  create: (
    token: string,
    input: { categoryId: string; type: "income" | "expense"; amount: number; note?: string; occurredOn: string }
  ) => request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(input), token }),
  update: (
    token: string,
    id: string,
    input: { categoryId?: string; amount?: number; note?: string; occurredOn?: string }
  ) => request<Transaction>(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input), token }),
  remove: (token: string, id: string) => request<void>(`/transactions/${id}`, { method: "DELETE", token }),
  summary: (token: string, month: string) => request<Summary>(`/transactions/summary?month=${month}`, { token }),
};

// ---- Pro modullar ----

export interface ReferralStatus {
  code: string;
  referredCount: number;
  requiredCount: number;
  unlocked: boolean;
  unlockedViaReferral: boolean;
}

export const referralsApi = {
  me: (token: string) => request<ReferralStatus>("/referrals/me", { token }),
};

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  periodMonth: string;
  spent: number;
}

export const budgetsApi = {
  list: (token: string, month?: string) =>
    request<Budget[]>(`/budgets${month ? `?month=${month}` : ""}`, { token }),
  create: (token: string, input: { categoryId: string; limitAmount: number; periodMonth: string }) =>
    request<Budget>("/budgets", { method: "POST", body: JSON.stringify(input), token }),
  update: (token: string, id: string, limitAmount: number) =>
    request<Budget>(`/budgets/${id}`, { method: "PATCH", body: JSON.stringify({ limitAmount }), token }),
  remove: (token: string, id: string) => request<void>(`/budgets/${id}`, { method: "DELETE", token }),
};

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: "active" | "achieved" | "cancelled";
}

export const goalsApi = {
  list: (token: string) => request<Goal[]>("/goals", { token }),
  create: (token: string, input: { title: string; targetAmount: number; deadline?: string }) =>
    request<Goal>("/goals", { method: "POST", body: JSON.stringify(input), token }),
  contribute: (token: string, id: string, amount: number) =>
    request<Goal>(`/goals/${id}/contribute`, { method: "PATCH", body: JSON.stringify({ amount }), token }),
  update: (token: string, id: string, input: { title?: string; targetAmount?: number; deadline?: string }) =>
    request<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(input), token }),
  remove: (token: string, id: string) => request<void>(`/goals/${id}`, { method: "DELETE", token }),
};

export interface Debt {
  id: string;
  personName: string;
  direction: "owed_to_me" | "i_owe";
  amount: number;
  dueDate: string | null;
  status: "open" | "closed";
}

export const debtsApi = {
  list: (token: string) => request<Debt[]>("/debts", { token }),
  create: (
    token: string,
    input: { personName: string; direction: "owed_to_me" | "i_owe"; amount: number; dueDate?: string }
  ) => request<Debt>("/debts", { method: "POST", body: JSON.stringify(input), token }),
  close: (token: string, id: string) => request<Debt>(`/debts/${id}/close`, { method: "PATCH", token }),
  update: (
    token: string,
    id: string,
    input: { personName?: string; direction?: "owed_to_me" | "i_owe"; amount?: number; dueDate?: string }
  ) => request<Debt>(`/debts/${id}`, { method: "PATCH", body: JSON.stringify(input), token }),
  remove: (token: string, id: string) => request<void>(`/debts/${id}`, { method: "DELETE", token }),
};

export interface RecurringPayment {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  reminderDaysBefore: number;
  isActive: boolean;
}

export const recurringApi = {
  list: (token: string) => request<RecurringPayment[]>("/recurring-payments", { token }),
  create: (token: string, input: { title: string; amount: number; dueDay: number; reminderDaysBefore?: number }) =>
    request<RecurringPayment>("/recurring-payments", { method: "POST", body: JSON.stringify(input), token }),
  update: (
    token: string,
    id: string,
    input: { title?: string; amount?: number; dueDay?: number; reminderDaysBefore?: number; isActive?: boolean }
  ) => request<RecurringPayment>(`/recurring-payments/${id}`, { method: "PATCH", body: JSON.stringify(input), token }),
  remove: (token: string, id: string) => request<void>(`/recurring-payments/${id}`, { method: "DELETE", token }),
};

// ---- Admin panel ----

export interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  proViaReferral: number;
  proViaAdminGrant: number;
  totalReferredSignups: number;
  totalTransactions: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  plan: "free" | "pro";
  proUnlockedVia: string | null;
  role: "user" | "admin";
  referralCode: string;
  referredCount: number;
  createdAt: string;
}

export interface AdminUserList {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export const adminApi = {
  stats: (token: string) => request<AdminStats>("/admin/stats", { token }),
  users: (token: string, params: { search?: string; page?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", String(params.page));
    return request<AdminUserList>(`/admin/users?${qs.toString()}`, { token });
  },
  grantPro: (token: string, userId: string) =>
    request<void>(`/admin/users/${userId}/grant-pro`, { method: "POST", token }),
  revokePro: (token: string, userId: string) =>
    request<void>(`/admin/users/${userId}/revoke-pro`, { method: "POST", token }),
};
