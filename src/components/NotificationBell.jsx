import { Bell } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function NotificationBell() {
  const { role, notifications } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const hasUnread =
    role === "coordinator"
      ? notifications.some((n) => n.type === "welfare_alert" && !n.read)
      : notifications.some(
          (n) => (n.audience === "volunteer" || n.audience === "all") && !n.read
        );

  function handleClick() {
    if (role === "coordinator") {
      if (pathname.startsWith("/coordinator/notifications")) {
        navigate("/coordinator/dashboard");
      } else {
        navigate("/coordinator/notifications?tab=welfare");
      }
    } else {
      if (pathname.startsWith("/volunteer/notifications")) {
        navigate("/volunteer/visits");
      } else {
        navigate("/volunteer/notifications");
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center min-h-10 min-w-10 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
      aria-label="Notifications"
    >
      <Bell className="w-4.5 h-4.5 text-brandNavy" />
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-alert rounded-full ring-2 ring-white" />
      )}
    </button>
  );
}
