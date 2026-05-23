import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Clock,
  XCircle,
  ChevronRight,
  BellOff,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { relativeTime } from "../../utils/format";
import EmptyState from "../../components/EmptyState";

const TABS = [
  { key: "all", label: "All", type: null },
  { key: "assignments", label: "Assignments", type: "assignment" },
  { key: "changes", label: "Changes", type: "visit_change" },
  { key: "cancellations", label: "Cancellations", type: "cancellation" },
];

const ICON_MAP = {
  assignment: { Icon: UserPlus, bg: "bg-brandTeal/10 text-brandTeal" },
  visit_change: { Icon: Clock, bg: "bg-amber-100 text-amber-700" },
  cancellation: { Icon: XCircle, bg: "bg-red-100 text-red-600" },
};

const EMPTY_COPY = {
  all: { title: "No notifications", message: "You're all caught up" },
  assignments: { title: "No assignments", message: "No assignment notifications yet" },
  changes: { title: "No changes", message: "No visit changes to show" },
  cancellations: { title: "No cancellations", message: "Nothing cancelled recently" },
};

export default function VolunteerNotifications() {
  const { notifications, markNotificationRead } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const volNotifs = useMemo(
    () =>
      notifications
        .filter((n) => n.audience === "volunteer" || n.audience === "all")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications]
  );

  const unreadCounts = useMemo(() => ({
    all: volNotifs.filter((n) => !n.read).length,
    assignments: volNotifs.filter((n) => n.type === "assignment" && !n.read).length,
    changes: volNotifs.filter((n) => n.type === "visit_change" && !n.read).length,
    cancellations: volNotifs.filter((n) => n.type === "cancellation" && !n.read).length,
  }), [volNotifs]);

  const rawTab = searchParams.get("tab");
  const validKeys = TABS.map((t) => t.key);
  const activeTab = rawTab && validKeys.includes(rawTab) ? rawTab : "all";

  const currentTabMeta = TABS.find((t) => t.key === activeTab);
  const rows = currentTabMeta.type
    ? volNotifs.filter((n) => n.type === currentTabMeta.type)
    : volNotifs;

  function handleTabClick(key) {
    setSearchParams({ tab: key }, { replace: true });
  }

  function handleRowClick(notif) {
    if (!notif.read) markNotificationRead(notif.id);
    navigate(`/volunteer/visits/${notif.requestId}`);
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
            const { Icon, bg } = ICON_MAP[notif.type] || ICON_MAP.assignment;
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
                    Visit #{notif.requestId} &middot;{" "}
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
