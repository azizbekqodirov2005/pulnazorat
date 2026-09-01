import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "positive" | "negative";
}) {
  const toneClasses =
    tone === "positive"
      ? { badge: "bg-emerald-50 text-emerald-600", value: "text-emerald-700" }
      : { badge: "bg-red-50 text-red-600", value: "text-red-700" };

  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses.badge}`}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">{label}</p>
        <p className={`text-[14px] font-bold leading-tight ${toneClasses.value}`}>{value}</p>
      </div>
    </div>
  );
}
