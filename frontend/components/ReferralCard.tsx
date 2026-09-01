"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, PartyPopper } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { referralsApi, ReferralStatus } from "@/lib/api";
import ProgressBar from "./ProgressBar";

const PRO_FEATURES = [
  "Byudjet limiti va ogohlantirish",
  "Takrorlanuvchi to'lov eslatmalari",
  "Jamg'arma maqsadlari",
  "Qarz-nasiya kuzatuvi",
];

export default function ReferralCard({ onUnlocked }: { onUnlocked?: () => void }) {
  const { token, applyToken } = useAuth();
  const [status, setStatus] = useState<ReferralStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (!token) return;
    referralsApi.me(token).then(async (s) => {
      setStatus(s);
      if (s.unlocked) {
        // Foydalanuvchi boshqa joyda (masalan boshqa qurilmada) referal orqali Pro'ga
        // o'tgan bo'lsa ham, joriy sessiyadagi eski token buni bilmasligi mumkin — yangilaymiz.
        await applyToken(token);
        onUnlocked?.();
      }
    });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status && typeof window !== "undefined") {
      setLink(`${window.location.origin}/register?ref=${status.code}`);
    }
  }, [status]);

  function handleCopy() {
    if (!link) return;
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!status) return null;

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Gift size={17} />
        </span>
        <h2 className="font-semibold text-slate-800">Do&apos;stlaringizni taklif qiling</h2>
      </div>

      <ul className="mb-4 flex flex-col gap-1.5">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-slate-600">
            <Check size={14} className="shrink-0 text-brand-600" />
            {f}
          </li>
        ))}
      </ul>

      <p className="text-[13px] text-slate-600">
        <span className="font-semibold text-brand-700">{status.requiredCount} ta do&apos;stingiz</span> shaxsiy
        havolangiz orqali ro&apos;yxatdan o&apos;tsa, Pro imkoniyatlari sizga{" "}
        <span className="font-semibold text-brand-700">butunlay tekin</span> ochiladi.
      </p>

      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="font-medium text-slate-600">
            {status.referredCount} / {status.requiredCount} do&apos;st qo&apos;shildi
          </span>
        </div>
        <ProgressBar ratio={status.referredCount / status.requiredCount} />
      </div>

      <div className="mt-4 flex gap-2">
        <input readOnly value={link} className="input truncate text-[12px]" onFocus={(e) => e.target.select()} />
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-auto shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {copied ? <PartyPopper size={15} /> : <Copy size={15} />}
          {copied ? "Nusxalandi" : "Nusxalash"}
        </button>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-slate-400">
        Yoki kodni ulashing: <span className="font-semibold text-slate-500">{status.code}</span>
      </p>
    </div>
  );
}
