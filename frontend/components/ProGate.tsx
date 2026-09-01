"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import ReferralCard from "./ReferralCard";

export default function ProGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (user?.plan === "pro") return <>{children}</>;

  return (
    <div className="app-container py-2">
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock size={20} />
        </span>
        <h1 className="mt-3 text-lg font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <ReferralCard />
    </div>
  );
}
