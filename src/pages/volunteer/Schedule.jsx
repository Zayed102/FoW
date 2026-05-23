import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS, SERVICING_SUBURBS } from "../../data/districts";
import { toDateStr, weekdayOf, weekStart, addDays } from "../../utils/format";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCOPE_MAP = { default: "default", current: "currentWeek", next: "nextWeek" };
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const TABS = [
  { key: "default", label: "Default schedule" },
  { key: "current", label: "Current week" },
  { key: "next", label: "Next week" },
];

function formatHour(h) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function rangesToHours(ranges) {
  const hours = new Set();
  for (const r of ranges) {
    const [start, end] = r.split("-");
    const s = parseInt(start.split(":")[0], 10);
    const e = parseInt(end.split(":")[0], 10);
    for (let h = s; h < e; h++) hours.add(h);
  }
  return hours;
}

function hoursToRanges(hourSet) {
  const sorted = [...hourSet].sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0] + 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end) {
      end = sorted[i] + 1;
    } else {
      ranges.push(
        `${String(start).padStart(2, "0")}:00-${String(end).padStart(2, "0")}:00`
      );
      start = sorted[i];
      end = sorted[i] + 1;
    }
  }
  ranges.push(
    `${String(start).padStart(2, "0")}:00-${String(end).padStart(2, "0")}:00`
  );
  return ranges;
}

const SUBURB_TO_DISTRICT = {};
for (const [distKey, suburbs] of Object.entries(SERVICING_SUBURBS)) {
  for (const s of suburbs) SUBURB_TO_DISTRICT[s] = distKey;
}

export default function Schedule() {
  const {
    volunteers,
    currentVolunteerId,
    requests,
    updateAvailability,
    updatePreferredDistrict,
    updateSuburbRanking,
    pushToast,
  } = useApp();
  const volunteer = volunteers.find((v) => v.id === currentVolunteerId);

  const [activeTab, setActiveTab] = useState("default");

  const currentWeekMon = weekStart(new Date());
  const nextWeekMon = addDays(currentWeekMon, 7);

  const weekDates = useMemo(() => {
    if (activeTab === "default") return null;
    const mon = activeTab === "current" ? currentWeekMon : nextWeekMon;
    return DAY_KEYS.map((_, i) => addDays(mon, i));
  }, [activeTab, currentWeekMon, nextWeekMon]);

  const todayString = toDateStr(new Date());
  const todayRowIdx = weekDates
    ? weekDates.findIndex((d) => toDateStr(d) === todayString)
    : -1;

  const scope = SCOPE_MAP[activeTab];
  const availability = volunteer?.availability?.[scope] || {};

  const lockedMap = useMemo(() => {
    if (activeTab === "default" || !weekDates) return {};
    const startStr = toDateStr(weekDates[0]);
    const endStr = toDateStr(weekDates[6]);
    const map = {};
    for (const r of requests) {
      if (
        r.assignedVolunteerId === currentVolunteerId &&
        r.visitDate >= startStr &&
        r.visitDate <= endStr &&
        (r.status === "assigned" || r.status === "ongoing")
      ) {
        const dayKey = weekdayOf(r.visitDate);
        if (!map[dayKey]) map[dayKey] = {};
        const [startTime, endTime] = r.timeSlot.split("-");
        const startH = parseInt(startTime.split(":")[0], 10);
        const endH = parseInt(endTime.split(":")[0], 10);
        let first = true;
        for (let h = startH; h < endH; h++) {
          map[dayKey][h] = { id: r.id, isFirst: first };
          first = false;
        }
      }
    }
    return map;
  }, [activeTab, weekDates, requests, currentVolunteerId]);

  const handleCellToggle = useCallback(
    (dayKey, hour) => {
      const ranges = availability[dayKey] || [];
      const hours = rangesToHours(ranges);
      if (hours.has(hour)) {
        hours.delete(hour);
      } else {
        hours.add(hour);
      }
      const newRanges = hoursToRanges(hours);
      updateAvailability(currentVolunteerId, scope, { [dayKey]: newRanges }, true);
    },
    [availability, currentVolunteerId, scope, updateAvailability]
  );

  const handleDistrictChange = useCallback(
    (e) => {
      updatePreferredDistrict(currentVolunteerId, e.target.value);
      pushToast("Preferred district updated", "success");
    },
    [currentVolunteerId, updatePreferredDistrict, pushToast]
  );

  const handleMoveSuburb = useCallback(
    (index, direction) => {
      const ranking = [...(volunteer?.suburbRanking || [])];
      const target = index + direction;
      if (target < 0 || target >= ranking.length) return;
      [ranking[index], ranking[target]] = [ranking[target], ranking[index]];
      updateSuburbRanking(currentVolunteerId, ranking);
    },
    [volunteer?.suburbRanking, currentVolunteerId, updateSuburbRanking]
  );

  if (!volunteer) return null;

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-extrabold">My schedule</h1>
      <p className="text-sm text-gray-500">Manage your availability</p>

      <div className="mt-4 flex overflow-x-auto gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 min-h-10 px-4 pb-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-brandPink text-brandPink font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "default" && (
        <p className="mt-3 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded p-2">
          Adjustments here override your default for this week only
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brandTeal" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-400" /> Assigned visit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-200" /> Unset
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
        <table className="border-collapse" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-2 py-2 text-xs font-semibold text-gray-500 text-left min-w-[4.5rem] w-[4.5rem]">
                Day
              </th>
              {HOURS.map((hour) => (
                <th
                  key={hour}
                  className="border-b border-gray-200 px-0 py-2 text-[11px] font-semibold text-gray-600 text-center min-w-11 w-11"
                >
                  {formatHour(hour)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAY_KEYS.map((day, rowIdx) => {
              const isToday = activeTab === "current" && todayRowIdx === rowIdx;
              return (
                <tr key={day}>
                  <td
                    className={`sticky left-0 z-10 border-r border-gray-200 px-2 py-0 text-xs font-semibold whitespace-nowrap min-h-11 h-11 ${
                      isToday ? "bg-brandPink/10 text-brandPink" : "bg-white text-gray-600"
                    }`}
                  >
                    <div>{day}</div>
                    {weekDates && (
                      <div className="font-normal text-[10px]">
                        {weekDates[rowIdx].getDate()}/{weekDates[rowIdx].getMonth() + 1}
                      </div>
                    )}
                  </td>
                  {HOURS.map((hour) => {
                    const locked = lockedMap[day]?.[hour];
                    const dayRanges = availability[day] || [];
                    const isAvail = rangesToHours(dayRanges).has(hour);
                    const todayRing = isToday ? " ring-1 ring-inset ring-brandPink/20" : "";

                    if (locked) {
                      return (
                        <td key={hour} className="p-0 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() =>
                              pushToast(
                                "Cancel the visit from your Visit list to free this slot",
                                "info"
                              )
                            }
                            className={`w-full min-h-11 h-11 min-w-11 flex items-center justify-center bg-amber-400/90 text-white text-[9px] font-semibold leading-tight${todayRing}`}
                          >
                            {locked.isFirst ? `#${locked.id}` : ""}
                          </button>
                        </td>
                      );
                    }

                    if (isAvail) {
                      return (
                        <td key={hour} className="p-0 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleCellToggle(day, hour)}
                            className={`w-full min-h-11 h-11 min-w-11 bg-brandTeal text-white transition hover:bg-brandTeal/80${todayRing}`}
                          />
                        </td>
                      );
                    }

                    return (
                      <td key={hour} className="p-0 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleCellToggle(day, hour)}
                          className={`w-full min-h-11 h-11 min-w-11 bg-gray-50 transition hover:bg-brandTeal/20${todayRing}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      <section className="mb-6">
        <h2 className="text-lg font-extrabold text-brandNavy">Preferred district</h2>
        <select
          value={volunteer.preferredDistrict || ""}
          onChange={handleDistrictChange}
          className="mt-2 min-h-10 w-full md:w-auto rounded-lg border border-gray-200 px-3 text-sm text-brandNavy bg-white"
        >
          {Object.entries(DISTRICTS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-brandNavy">Suburb preferences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use the arrows to rank suburbs. Higher = more preferred. Used to prioritise you for matching deliveries.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          {(volunteer.suburbRanking || []).map((suburb, idx) => {
            const distKey = SUBURB_TO_DISTRICT[suburb];
            return (
              <div
                key={suburb}
                className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-400 w-6 shrink-0 text-right">
                    {idx + 1}.
                  </span>
                  <span className="text-sm font-semibold text-brandNavy truncate">
                    {suburb}
                  </span>
                  {distKey && (
                    <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal">
                      {DISTRICTS[distKey]}
                    </span>
                  )}
                  {idx === 0 && (
                    <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brandPink/10 text-brandPink">
                      Preferred
                    </span>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSuburb(idx, -1)}
                    className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`Move ${suburb} up`}
                  >
                    <ChevronUp className="w-4 h-4 text-brandNavy" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === (volunteer.suburbRanking?.length || 0) - 1}
                    onClick={() => handleMoveSuburb(idx, 1)}
                    className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`Move ${suburb} down`}
                  >
                    <ChevronDown className="w-4 h-4 text-brandNavy" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
