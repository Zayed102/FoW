const now = new Date();
const t = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

export const initialNotifications = [
  {
    id: "notif-1",
    type: "welfare_alert",
    message: "Welfare concern flagged for Norman Yeung (req-12). Volunteer reported recipient appeared confused.",
    requestId: "req-12",
    createdAt: t(2),
    read: false,
    audience: "coordinator",
  },
  {
    id: "notif-2",
    type: "welfare_alert",
    message: "Unable to complete delivery for Olive Müller (req-13). Recipient may be hospitalised.",
    requestId: "req-13",
    createdAt: t(6),
    read: false,
    audience: "coordinator",
  },
  {
    id: "notif-3",
    type: "cancellation",
    message: "Visit for Peter Amara (req-14) on 20 May has been cancelled.",
    requestId: "req-14",
    createdAt: t(20),
    read: false,
    audience: "coordinator",
  },
  {
    id: "notif-4",
    type: "completion",
    message: "Visit for Linda Rossi (req-11) completed successfully by Sarah Mitchell.",
    requestId: "req-11",
    createdAt: t(48),
    read: true,
    audience: "coordinator",
  },
  {
    id: "notif-5",
    type: "completion",
    message: "Visit for Norman Yeung (req-12) completed with concern by James Cooper.",
    requestId: "req-12",
    createdAt: t(96),
    read: true,
    audience: "coordinator",
  },
  {
    id: "notif-6",
    type: "assignment",
    message: "Sarah Mitchell has been assigned to visit Edna Park (req-5) on 21 May.",
    requestId: "req-5",
    createdAt: t(72),
    read: true,
    audience: "all",
  },
];
