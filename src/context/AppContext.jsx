import { createContext, useContext, useState, useCallback, useRef } from "react";
import { requests as seedRequests } from "../data/requests";
import { volunteers as seedVolunteers } from "../data/volunteers";
import { visits as seedVisits } from "../data/visits";
import { initialNotifications } from "../data/notifications";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState("coordinator");
  const [activeDistrict, setActiveDistrict] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentVolunteerId = "v1";

  const [requests, setRequests] = useState(seedRequests);
  const [volunteers, setVolunteers] = useState(seedVolunteers);
  const [visits, setVisits] = useState(seedVisits);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const pushToast = useCallback((message, kind = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const login = useCallback((loginRole) => {
    setRole(loginRole);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const resetCoordinatorFilters = useCallback(() => {
    setActiveDistrict("all");
    setStatusFilter("all");
    setDateFilter("all");
  }, []);

  const assignVolunteer = useCallback((requestId, volunteerId) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "assigned", assignedVolunteerId: volunteerId } : r
      )
    );
    pushToast("Volunteer assigned successfully", "success");
  }, [pushToast]);

  const cancelVisit = useCallback((requestId) => {
    let reqName = "";
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        reqName = r.requestorName;
        return { ...r, status: "unassigned", assignedVolunteerId: null };
      })
    );
    setVisits((prev) =>
      prev.map((v) =>
        v.requestId === requestId ? { ...v, status: "cancelled" } : v
      )
    );
    setNotifications((prev) => [
      {
        id: `notif-cancel-${Date.now()}`,
        type: "cancellation",
        message: `Volunteer cancelled assignment for ${reqName || "a request"} (${requestId}). Reassignment needed.`,
        requestId,
        createdAt: new Date().toISOString(),
        read: false,
        audience: "coordinator",
      },
      ...prev,
    ]);
    pushToast("Visit cancelled", "warning");
  }, [pushToast]);

  const updateVisitStatus = useCallback((requestId, newStatus) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: newStatus } : r
      )
    );
    setVisits((prev) =>
      prev.map((v) =>
        v.requestId === requestId ? { ...v, status: newStatus } : v
      )
    );
  }, []);

  const recordOutcome = useCallback((requestId, outcome) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "completed", outcome: { ...outcome, recordedAt: new Date().toISOString() } }
          : r
      )
    );
    setVisits((prev) =>
      prev.map((v) =>
        v.requestId === requestId ? { ...v, status: "completed" } : v
      )
    );
    pushToast("Outcome recorded", "success");
  }, [pushToast]);

  const updateAvailability = useCallback((volunteerId, week, dayRanges, silent = false) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, availability: { ...v.availability, [week]: { ...v.availability[week], ...dayRanges } } }
          : v
      )
    );
    if (!silent) pushToast("Availability updated", "success");
  }, [pushToast]);

  const updateSuburbRanking = useCallback((volunteerId, orderedSuburbArray) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId ? { ...v, suburbRanking: orderedSuburbArray } : v
      )
    );
  }, []);

  const updatePreferredDistrict = useCallback((volunteerId, districtId) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId ? { ...v, preferredDistrict: districtId } : v
      )
    );
  }, []);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      )
    );
  }, []);

  const value = {
    role,
    setRole,
    activeDistrict,
    setActiveDistrict,
    isAuthenticated,
    currentVolunteerId,
    login,
    logout,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    resetCoordinatorFilters,
    requests,
    volunteers,
    visits,
    notifications,
    assignVolunteer,
    cancelVisit,
    updateVisitStatus,
    recordOutcome,
    updateAvailability,
    updateSuburbRanking,
    updatePreferredDistrict,
    markNotificationRead,
    pushToast,
    toasts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
