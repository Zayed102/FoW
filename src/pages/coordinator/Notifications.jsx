import { useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronRight,
  BellOff,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { relativeTime } from "../../utils/format";
import EmptyState from "../../components/EmptyState";

const TABS = [
  { key: "welfare", label: "Welfare alerts", type: "welfare_alert" },
  { key: "cancellations", label: "Cancellations", type: "cancellation" },
  { key: "completed", label: "Completed", type: "completion" },
];

const ICON_MAP = {
  welfare_alert: { Icon: AlertTriangle, bg: "bg-alert/10 text-alert" },
  cancellation: { Icon: XCircle, bg: "bg-red-100 text-red-600" },
  completion: { Icon: CheckCircle, bg: "bg-green-100 text-green-600" },
};

const EMPTY_COPY = {
  welfare: { title: "No welfare alerts", message: "All clear for now" },
  cancellations: { title: "No cancellations", message: "Nothing cancelled recently" },
  completed: { title: "No completions", message: "No completed visits yet" },
};

export default function Notifications() {
  const { notifications, requests, activeDistrict, markNotificationRead } =
    useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inScope = useCallback(
    (notif) => {
      if (activeDistrict === "all") return true;
      const req = requests.find((r) => r.id === notif.requestId);
      return req?.districtId === activeDistrict;
    },
    [requests, activeDistrict]
  );

  const grouped = useMemo(() => {
    const map = { welfare_alert: [], cancellation: [], completion: [] };
    for (const n of notifications) {
      if (map[n.type] && inScope(n)) map[n.type].push(n);
    }
    return map;
  }, [notifications, inScope]);

  const unreadCounts = useMemo(() => ({
    welfare: grouped.welfare_alert.filter((n) => !n.read).length,
    cancellations: grouped.cancellation.filter((n) => !n.read).length,
    completed: grouped.completion.filter((n) => !n.read).length,
  }), [grouped]);

  const rawTab = searchParams.get("tab");
  const validTabs = TABS.map((t) => t.key);
  let activeTab;
  if (rawTab && validTabs.includes(rawTab)) {
    activeTab = rawTab;
  } else if (unreadCounts.welfare > 0) {
    activeTab = "welfare";
  } else {
    activeTab = "cancellations";
  }

  const currentTabMeta = TABS.find((t) => t.key === activeTab);
  const rows = grouped[currentTabMeta.type] || [];

  function handleTabClick(key) {
    setSearchParams({ tab: key }, { replace: true });
  }

  function handleRowClick(notif) {
    if (!notif.read) markNotificationRead(notif.id);
    navigate(`/coordinator/requests/${notif.requestId}`);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-extrabold">Notifications</h1>

      <div className="mt-4 flex overflow-x-auto gap-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const unread = unreadCounts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`shrink-0 min-h-10 px-4 pb-2 text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? "border-b-2 border-brandPink text-brandPink font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {unread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-brandPink/15 text-brandPink">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {rows.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={EMPTY_COPY[activeTab].title}
            message={EMPTY_COPY[activeTab].message}
          />
        ) : (
          rows.map((notif) => {
            const { Icon, bg } = ICON_MAP[notif.type] || ICON_MAP.completion;
            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleRowClick(notif)}
                className="w-full bg-white rounded-2xl shadow-sm p-3 md:p-4 min-h-10 flex items-start gap-3 text-left hover:ring-2 hover:ring-brandPink/40 transition"
              >
                <span
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${bg}`}
                >
                  <Icon className="w-4 h-4" />
                </span>

                <span className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-sm md:text-base text-brandNavy">
                    {notif.message}
                  </span>
                  <span className="text-xs text-gray-500">
                    Request #{notif.requestId} &middot;{" "}
                    {relativeTime(notif.createdAt)}
                  </span>
                </span>

                <span className="shrink-0 flex flex-col items-end gap-1">
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-brandPink" />
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
