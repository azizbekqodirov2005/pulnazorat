"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, User } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => void;
  /** Yangi accessToken kelganda (masalan Pro'ga o'tgach) foydalanuvchi ma'lumotini qayta yuklaydi. */
  applyToken: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("pn_token") : null;
    if (!storedToken) {
      setLoading(false);
      return;
    }
    authApi
      .me(storedToken)
      .then((u) => {
        setUser(u);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem("pn_token");
      })
      .finally(() => setLoading(false));
  }, []);

  function persist(newToken: string, newUser: User) {
    localStorage.setItem("pn_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(emailOrPhone: string, password: string) {
    const result = await authApi.login({ emailOrPhone, password });
    persist(result.accessToken, result.user);
  }

  async function register(input: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }) {
    const result = await authApi.register(input);
    persist(result.accessToken, result.user);
  }

  async function applyToken(accessToken: string) {
    const freshUser = await authApi.me(accessToken);
    persist(accessToken, freshUser);
  }

  function logout() {
    localStorage.removeItem("pn_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, applyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
