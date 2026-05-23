import { AlertTriangle } from "lucide-react";

export default function WelfareBanner({ count, onClick }) {
  if (count === 0) return null;

  return (
    <div className="w-full bg-alert/10 border border-alert/30 text-alert rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span className="font-semibold flex-1 text-sm md:text-base">
        {count} welfare alert{count !== 1 ? "s" : ""} need review
      </span>
      <button
        type="button"
        onClick={onClick}
        className="bg-alert hover:bg-alert/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition"
      >
        Review
      </button>
    </div>
  );
}
