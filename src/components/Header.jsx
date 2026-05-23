import { NavLink, useNavigate } from "react-router-dom";
import DistrictFilter from "./DistrictFilter";
import NotificationBell from "./NotificationBell";
import { useApp } from "../context/AppContext";
import { Heart, LogOut, ClipboardList, CalendarDays } from "lucide-react";

export default function Header() {
  const { role, logout, resetCoordinatorFilters } = useApp();
  const navigate = useNavigate();

  function handleLogoClick() {
    resetCoordinatorFilters();
    navigate(role === "volunteer" ? "/volunteer/visits" : "/coordinator/dashboard");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
      <button
        type="button"
        onClick={handleLogoClick}
        className="flex items-center gap-2 mr-auto min-h-10 cursor-pointer"
      >
        <Heart className="w-6 h-6 text-brandPink fill-brandPink" />
        <span className="text-lg font-extrabold tracking-tight text-brandNavy hidden sm:inline">
          friendshipOnWheels
        </span>
        <span className="text-lg font-extrabold tracking-tight text-brandNavy sm:hidden">
          FoW
        </span>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        {role === "coordinator" && <DistrictFilter />}

        {role === "volunteer" && (
          <>
            <NavLink
              to="/volunteer/visits"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 min-h-10 rounded-lg text-sm font-medium transition border ${
                  isActive
                    ? "border-brandPink bg-brandPink/10 text-brandPink"
                    : "border-gray-200 text-brandNavy hover:bg-gray-50"
                }`
              }
              aria-label="My Visits"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Visits</span>
            </NavLink>
            <NavLink
              to="/volunteer/schedule"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 min-h-10 rounded-lg text-sm font-medium transition border ${
                  isActive
                    ? "border-brandPink bg-brandPink/10 text-brandPink"
                    : "border-gray-200 text-brandNavy hover:bg-gray-50"
                }`
              }
              aria-label="Schedule"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </NavLink>
          </>
        )}

        <NotificationBell />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 min-h-10 rounded-lg text-sm font-medium transition border border-gray-200 hover:bg-gray-50"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4 text-brandNavy" />
          <span className="hidden sm:inline text-brandNavy">Log out</span>
        </button>
      </div>
    </header>
  );
}
