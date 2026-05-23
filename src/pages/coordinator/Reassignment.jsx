import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS } from "../../data/districts";
import { formatDateTime } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

export default function Reassignment() {
  const { requests, notifications, activeDistrict } = useApp();
  const navigate = useNavigate();

  const items = useMemo(() => {
    const districtFiltered =
      activeDistrict === "all"
        ? requests
        : requests.filter((r) => r.districtId === activeDistrict);

    const welfareRequestIds = new Set(
      notifications
        .filter((n) => n.type === "welfare_alert" && !n.read)
        .map((n) => n.requestId)
    );

    const map = new Map();

    for (const r of districtFiltered) {
      if (r.status === "cancelled") {
        map.set(r.id, r);
      }
      if (welfareRequestIds.has(r.id)) {
        map.set(r.id, r);
      }
    }

    return Array.from(map.values());
  }, [requests, notifications, activeDistrict]);

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-extrabold">Reassignment</h1>
      <p className="text-sm text-gray-500">Requests needing action</p>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 md:p-4 text-amber-800 text-sm md:text-base font-medium">
        Requests needing reassignment: {items.length}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {items.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All clear"
            message="No requests need reassignment right now"
          />
        ) : (
          items.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl shadow-sm p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-3 min-w-0 flex-1">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-gray-500">#{req.id}</span>
                  <span className="font-semibold text-base text-brandNavy truncate">
                    {req.requestorName}
                  </span>
                  <span className="text-sm text-gray-600">
                    {DISTRICTS[req.districtId] || req.districtId} &middot;{" "}
                    {formatDateTime(req.visitDate, req.timeSlot)}
                  </span>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <button
                type="button"
                onClick={() => navigate(`/coordinator/requests/${req.id}`)}
                className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Reassign now
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
