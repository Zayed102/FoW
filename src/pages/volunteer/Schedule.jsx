import { useState, useMemo, useCallback } from "react";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS, SERVICING_SUBURBS } from "../../data/districts";
import { toDateStr, shortDate, weekdayOf, weekStart, addDays } from "../../utils/format";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCOPE_MAP = { default: "default", current: "currentWeek", next: "nextWeek" };

const TABS = [
  { key: "default", label: "Default schedule" },
  { key: "current", label: "Current week" },
  { key: "next", label: "Next week" },
];

function buildTimeOptions() {
  const opts = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      opts.push(val);
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

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
  const [openAddDay, setOpenAddDay] = useState(null);
  const [draftStart, setDraftStart] = useState("09:00");
  const [draftEnd, setDraftEnd] = useState("12:00");

  const currentWeekMon = weekStart(new Date());
  const nextWeekMon = addDays(currentWeekMon, 7);

  const weekDates = useMemo(() => {
    if (activeTab === "default") return null;
    const mon = activeTab === "current" ? currentWeekMon : nextWeekMon;
    return DAY_KEYS.map((_, i) => addDays(mon, i));
  }, [activeTab, currentWeekMon, nextWeekMon]);

  const scope = SCOPE_MAP[activeTab];
  const availability = volunteer?.availability?.[scope] || {};

  const lockedVisits = useMemo(() => {
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
        if (!map[dayKey]) map[dayKey] = [];
        map[dayKey].push(r.timeSlot);
      }
    }
    return map;
  }, [activeTab, weekDates, requests, currentVolunteerId]);

  function handleRemoveRange(dayKey, range) {
    const current = [...(availability[dayKey] || [])];
    const updated = current.filter((r) => r !== range);
    updateAvailability(currentVolunteerId, scope, { [dayKey]: updated });
  }

  function handleAddRange(dayKey) {
    if (draftStart >= draftEnd) {
      pushToast("Start must be before end", "error");
      return;
    }
    const rangeStr = `${draftStart}-${draftEnd}`;
    const current = [...(availability[dayKey] || [])];
    current.push(rangeStr);
    current.sort((a, b) => a.localeCompare(b));
    updateAvailability(currentVolunteerId, scope, { [dayKey]: current });
    setOpenAddDay(null);
    setDraftStart("09:00");
    setDraftEnd("12:00");
  }

  function openAdd(dayKey) {
    setOpenAddDay(dayKey);
    setDraftStart("09:00");
    setDraftEnd("12:00");
  }

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
            onClick={() => {
              setActiveTab(tab.key);
              setOpenAddDay(null);
            }}
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

      <div className="mt-4 hidden md:grid grid-cols-7 gap-2">
        {DAY_KEYS.map((dayKey, i) => (
          <DayCard
            key={dayKey}
            dayKey={dayKey}
            date={weekDates?.[i]}
            showDate={activeTab !== "default"}
            ranges={availability[dayKey] || []}
            locked={lockedVisits[dayKey] || []}
            isAddOpen={openAddDay === dayKey}
            onOpenAdd={() => openAdd(dayKey)}
            onCloseAdd={() => setOpenAddDay(null)}
            onRemove={(range) => handleRemoveRange(dayKey, range)}
            onAdd={() => handleAddRange(dayKey)}
            draftStart={draftStart}
            draftEnd={draftEnd}
            setDraftStart={setDraftStart}
            setDraftEnd={setDraftEnd}
            pushToast={pushToast}
            layout="column"
          />
        ))}
      </div>

      <div className="mt-4 md:hidden flex flex-col gap-2">
        {DAY_KEYS.map((dayKey, i) => (
          <DayCard
            key={dayKey}
            dayKey={dayKey}
            date={weekDates?.[i]}
            showDate={activeTab !== "default"}
            ranges={availability[dayKey] || []}
            locked={lockedVisits[dayKey] || []}
            isAddOpen={openAddDay === dayKey}
            onOpenAdd={() => openAdd(dayKey)}
            onCloseAdd={() => setOpenAddDay(null)}
            onRemove={(range) => handleRemoveRange(dayKey, range)}
            onAdd={() => handleAddRange(dayKey)}
            draftStart={draftStart}
            draftEnd={draftEnd}
            setDraftStart={setDraftStart}
            setDraftEnd={setDraftEnd}
            pushToast={pushToast}
            layout="row"
          />
        ))}
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

function DayCard({
  dayKey,
  date,
  showDate,
  ranges,
  locked,
  isAddOpen,
  onOpenAdd,
  onCloseAdd,
  onRemove,
  onAdd,
  draftStart,
  draftEnd,
  setDraftStart,
  setDraftEnd,
  pushToast,
  layout,
}) {
  const dateLabel = date ? shortDate(date) : null;

  if (layout === "row") {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 flex items-start gap-3">
        <div className="w-20 shrink-0">
          <p className="font-semibold text-brandNavy text-sm">{dayKey}</p>
          {showDate && dateLabel && (
            <p className="text-xs text-gray-400">{dateLabel}</p>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <PillsAndAdd
            ranges={ranges}
            locked={locked}
            isAddOpen={isAddOpen}
            onOpenAdd={onOpenAdd}
            onCloseAdd={onCloseAdd}
            onRemove={onRemove}
            onAdd={onAdd}
            draftStart={draftStart}
            draftEnd={draftEnd}
            setDraftStart={setDraftStart}
            setDraftEnd={setDraftEnd}
            pushToast={pushToast}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-3 md:p-4 flex flex-col gap-2${isAddOpen ? " relative z-10" : ""}`}>
      <div>
        <p className="font-semibold text-brandNavy text-sm">{dayKey}</p>
        {showDate && dateLabel && (
          <p className="text-xs text-gray-400">{dateLabel}</p>
        )}
      </div>
      <PillsAndAdd
        ranges={ranges}
        locked={locked}
        isAddOpen={isAddOpen}
        onOpenAdd={onOpenAdd}
        onCloseAdd={onCloseAdd}
        onRemove={onRemove}
        onAdd={onAdd}
        draftStart={draftStart}
        draftEnd={draftEnd}
        setDraftStart={setDraftStart}
        setDraftEnd={setDraftEnd}
        pushToast={pushToast}
      />
    </div>
  );
}

function PillsAndAdd({
  ranges,
  locked,
  isAddOpen,
  onOpenAdd,
  onCloseAdd,
  onRemove,
  onAdd,
  draftStart,
  draftEnd,
  setDraftStart,
  setDraftEnd,
  pushToast,
}) {
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {ranges.map((r) => (
          <span
            key={r}
            className="inline-flex items-center bg-brandTeal/15 text-brandTeal rounded-full px-3 py-1 text-xs font-semibold"
          >
            {r}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(r); }}
              className="ml-1 min-h-5 min-w-5 inline-flex items-center justify-center hover:text-brandTeal/70 transition"
              aria-label={`Remove ${r}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {locked.map((slot) => (
          <button
            key={`locked-${slot}`}
            type="button"
            onClick={() =>
              pushToast(
                "Cancel the visit from your Visit list to free this slot",
                "info"
              )
            }
            className="inline-flex items-center bg-brandTeal text-white rounded-full px-3 py-1 min-h-7 text-xs font-semibold cursor-pointer"
          >
            {slot}
          </button>
        ))}
      </div>

      {!isAddOpen ? (
        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center gap-1 text-xs text-brandPink min-h-10 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add range
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <select
            value={draftStart}
            onChange={(e) => setDraftStart(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs min-h-10"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 hidden sm:block">–</span>
          <select
            value={draftEnd}
            onChange={(e) => setDraftEnd(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs min-h-10"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAdd}
            className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-xs font-semibold w-full sm:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCloseAdd}
            className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-xs font-semibold w-full sm:w-auto transition"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
