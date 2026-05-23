import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { groupByDateBucket, toDateStr, todayStr, weekStart, addDays } from "../../utils/format";
import WelfareBanner from "../../components/WelfareBanner";
import RequestCard from "../../components/RequestCard";
import EmptyState from "../../components/EmptyState";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const DATE_PRESETS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
];

const BUCKET_META = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "thisWeek", label: "This Week" },
  { key: "past", label: "Past" },
];

export default function Dashboard() {
  const {
    requests,
    notifications,
    activeDistrict,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
  } = useApp();
  const navigate = useNavigate();

  const todayDate = todayStr();
  const tomorrowDate = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return toDateStr(t);
  }, []);

  const monday = useMemo(() => weekStart(new Date()), []);
  const sundayStr = useMemo(() => toDateStr(addDays(monday, 6)), [monday]);
  const mondayStr = useMemo(() => toDateStr(monday), [monday]);

  const isSpecificDate = dateFilter !== "all" && dateFilter !== "today" && dateFilter !== "tomorrow" && dateFilter !== "week";
  const dateInputValue = isSpecificDate ? dateFilter : "";
  const selectValue = isSpecificDate ? "specific" : dateFilter;

  const welfareCount = useMemo(() => {
    return notifications.filter((n) => {
      if (n.type !== "welfare_alert" || n.read) return false;
      if (activeDistrict === "all") return true;
      const req = requests.find((r) => r.id === n.requestId);
      return req?.districtId === activeDistrict;
    }).length;
  }, [notifications, requests, activeDistrict]);

  const filtered = useMemo(() => {
    let list = requests;

    if (activeDistrict !== "all") {
      list = list.filter((r) => r.districtId === activeDistrict);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "assigned") {
        list = list.filter((r) => r.status === "assigned" || r.status === "ongoing");
      } else {
        list = list.filter((r) => r.status === statusFilter);
      }
    }

    if (dateFilter === "today") {
      list = list.filter((r) => r.visitDate === todayDate);
    } else if (dateFilter === "tomorrow") {
      list = list.filter((r) => r.visitDate === tomorrowDate);
    } else if (dateFilter === "week") {
      list = list.filter((r) => r.visitDate >= mondayStr && r.visitDate <= sundayStr);
    } else if (isSpecificDate) {
      list = list.filter((r) => r.visitDate === dateFilter);
    }

    return list;
  }, [requests, activeDistrict, statusFilter, dateFilter, todayDate, tomorrowDate, mondayStr, sundayStr, isSpecificDate]);

  const districtFiltered = useMemo(() => {
    if (activeDistrict === "all") return requests;
    return requests.filter((r) => r.districtId === activeDistrict);
  }, [requests, activeDistrict]);

  const buckets = useMemo(() => groupByDateBucket(filtered), [filtered]);

  const unassignedCount = districtFiltered.filter(
    (r) => r.status === "unassigned"
  ).length;

  const thisWeekTotal = useMemo(() => {
    return districtFiltered.filter(
      (r) => r.visitDate >= mondayStr && r.visitDate <= sundayStr
    ).length;
  }, [districtFiltered, mondayStr, sundayStr]);

  const hasResults = BUCKET_META.some(({ key }) => buckets[key].length > 0);

  function handlePresetChange(e) {
    const v = e.target.value;
    if (v === "specific") return;
    setDateFilter(v);
  }

  function handleDateInput(e) {
    const v = e.target.value;
    if (v) setDateFilter(v);
    else setDateFilter("all");
  }

  return (
    <div className="w-full">
      <WelfareBanner
        count={welfareCount}
        onClick={() => navigate("/coordinator/notifications?tab=welfare")}
      />

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Requests</h1>
          <p className="text-sm text-gray-500">Sorted chronologically</p>
        </div>

        <div className="flex flex-wrap gap-2 pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 min-h-10 px-4 rounded-full text-sm font-semibold transition ${
                statusFilter === f.value
                  ? "bg-brandPink text-white"
                  : "bg-white border border-brandNavy/20 text-brandNavy hover:border-brandNavy/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={selectValue}
          onChange={handlePresetChange}
          className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm text-brandNavy bg-white"
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
          {isSpecificDate && <option value="specific">Specific date</option>}
        </select>
        <input
          type="date"
          value={dateInputValue}
          onChange={handleDateInput}
          className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm text-brandNavy bg-white"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:flex md:gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4">
          <p className="text-sm text-gray-500">Unassigned</p>
          <p className="text-2xl font-extrabold text-brandNavy">
            {unassignedCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4">
          <p className="text-sm text-gray-500">Total this week</p>
          <p className="text-2xl font-extrabold text-brandNavy">
            {thisWeekTotal}
          </p>
        </div>
      </div>

      <div className="mt-5">
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
                      onClick={() =>
                        navigate(`/coordinator/requests/${req.id}`)
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <EmptyState
            icon={Inbox}
            title="Nothing here"
            message="Try changing the filter or district"
          />
        )}
      </div>
    </div>
  );
}
