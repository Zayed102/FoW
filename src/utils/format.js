const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateTime(visitDate, timeSlot) {
  const [year, month, day] = visitDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];

  const startTime = timeSlot.split("-")[0];
  const [h, m] = startTime.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const minutes = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;

  return `${dayName} ${day} ${monthName}, ${hour12}${minutes} ${period}`;
}

export function groupByDateBucket(requests) {
  const now = new Date();
  const todayVal = toDateStr(now);
  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  const tomorrowVal = toDateStr(tom);

  const dow = now.getDay();
  const mondayOff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = toDateStr(sunday);

  const buckets = { today: [], tomorrow: [], thisWeek: [], past: [] };

  for (const r of requests) {
    const d = r.visitDate;
    if (d === todayVal) buckets.today.push(r);
    else if (d === tomorrowVal) buckets.tomorrow.push(r);
    else if (d < todayVal) buckets.past.push(r);
    else if (d <= weekEndStr) buckets.thisWeek.push(r);
    else buckets.thisWeek.push(r);
  }

  buckets.past.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  return buckets;
}

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function shortDate(d) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function weekdayOf(visitDate) {
  const [y, m, d] = visitDate.split("-").map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
}

export function weekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function relativeTime(iso) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
