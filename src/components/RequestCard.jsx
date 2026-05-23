import { ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { DISTRICTS } from "../data/districts";
import { formatDateTime } from "../utils/format";

export default function RequestCard({ request, onClick, hideStatus = false }) {
  const districtLabel = DISTRICTS[request.districtId] || request.districtId;
  const dateLabel = formatDateTime(request.visitDate, request.timeSlot);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-sm p-3 md:p-4 min-h-10 flex items-start justify-between gap-3 cursor-pointer hover:ring-2 hover:ring-brandPink/40 transition text-left"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-gray-500">#{request.id}</span>
        <span className="font-semibold text-base text-brandNavy truncate">
          {request.requestorName}
        </span>
        <span className="text-sm text-gray-600">
          {districtLabel} &middot; {dateLabel}
        </span>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {!hideStatus && <StatusBadge status={request.status} />}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}
