import { Info, CheckCircle, AlertCircle } from "lucide-react";

const iconMap = {
  info: Info,
  success: CheckCircle,
  error: AlertCircle,
};

const accentMap = {
  info: "border-brandNavy/20 text-brandNavy",
  success: "border-brandTeal/30 text-brandTeal",
  error: "border-alert/30 text-alert",
};

export default function Toast({ toast }) {
  const Icon = iconMap[toast.kind] || Info;
  const accent = accentMap[toast.kind] || accentMap.info;

  return (
    <div
      className={`bg-white border rounded-lg shadow px-4 py-2 text-sm flex items-center gap-2 min-w-[200px] max-w-[90vw] ${accent}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
    </div>
  );
}
