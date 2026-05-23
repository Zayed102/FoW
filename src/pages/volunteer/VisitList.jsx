import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { groupByDateBucket, todayStr as getTodayStr } from "../../utils/format";
import RequestCard from "../../components/RequestCard";
import EmptyState from "../../components/EmptyState";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

const BUCKET_META = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "thisWeek", label: "This Week" },
  { key: "past", label: "Past" },
];

export default function VisitList() {
  const { requests, currentVolunteerId } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const myRequests = useMemo(
    () => requests.filter((r) => r.assignedVolunteerId === currentVolunteerId),
    [requests, currentVolunteerId]
  );

  const today = getTodayStr();

  const upcomingCount = myRequests.filter(
    (r) =>
      (r.status === "assigned" || r.status === "ongoing") &&
      r.visitDate >= today
  ).length;

  const filtered = useMemo(() => {
    switch (filter) {
      case "upcoming":
        return myRequests.filter(
          (r) =>
            (r.status === "assigned" || r.status === "ongoing") &&
            r.visitDate >= today
        );
      case "past":
        return myRequests.filter((r) => r.status === "completed");
      case "cancelled":
        return myRequests.filter((r) => r.status === "cancelled");
      default:
        return myRequests;
    }
  }, [myRequests, filter, today]);

  const buckets = useMemo(() => groupByDateBucket(filtered), [filtered]);
  const hasResults = BUCKET_META.some(({ key }) => buckets[key].length > 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold">My visits</h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brandTeal/15 text-brandTeal">
          Upcoming: {upcomingCount}
        </span>
      </div>

      <div className="mt-3 flex overflow-x-auto gap-2 pb-1 snap-x">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`shrink-0 snap-start min-h-10 px-4 rounded-full text-sm font-semibold transition ${
              filter === f.value
                ? "bg-brandPink text-white"
                : "bg-white border border-brandNavy/20 text-brandNavy hover:border-brandNavy/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {hasResults ? (
          BUCKET_META.map(({ key, label }) => {
            const items = buckets[key];
            if (items.length === 0) return null;
            return (
              <section key={key} className="mb-5">
                <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide mb-2">
                  {label}
                </h2>
                <div className="flex flex-col gap-2">
                  {items.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onClick={() => navigate(`/volunteer/visits/${req.id}`)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <EmptyState
            icon={Inbox}
            title="No visits"
            message="Try changing the filter"
          />
        )}
      </div>
    </div>
  );
}
