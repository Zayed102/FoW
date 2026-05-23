const weekdayRange = ["09:00-12:00", "13:00-17:00"];
const morningOnly = ["09:00-12:00"];
const afternoonOnly = ["13:00-18:00"];
const fullDay = ["09:00-18:00"];
const weekendFull = ["09:00-17:00"];

function buildAvailability(defaultMap, currentWeekOverrides = {}, nextWeekOverrides = {}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const base = {};
  days.forEach((d) => { base[d] = defaultMap[d] || []; });
  return {
    default: { ...base },
    currentWeek: { ...base, ...currentWeekOverrides },
    nextWeek: { ...base, ...nextWeekOverrides },
  };
}

export const volunteers = [
  {
    id: "v1",
    name: "Sarah Mitchell",
    phone: "0422 100 001",
    districts: ["eastside"],
    preferredDistrict: "eastside",
    suburbRanking: ["Bondi", "Maroubra", "Randwick", "Coogee", "Newtown", "Marrickville", "Leichhardt", "Crows Nest", "North Sydney", "Mosman", "Lane Cove", "Chatswood"],
    assignmentHistory: [
      { visitId: "req-5", date: "2026-05-21", outcome: "assigned" },
      { visitId: "req-9", date: "2026-05-21", outcome: "ongoing" },
      { visitId: "req-11", date: "2026-05-19", outcome: "completed_ok" },
      { visitId: "req-14", date: "2026-05-20", outcome: "cancelled" },
    ],
    availability: buildAvailability(
      { Mon: weekdayRange, Tue: weekdayRange, Wed: weekdayRange, Thu: weekdayRange, Fri: weekdayRange,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English"],
      hasVehicle: true,
      canAssistMobility: false,
      notes: "Available short notice",
    },
  },
  {
    id: "v2",
    name: "James Cooper",
    phone: "0422 100 002",
    districts: ["westend"],
    preferredDistrict: "westend",
    suburbRanking: ["Leichhardt", "Newtown", "Marrickville", "Bondi", "Coogee", "Randwick", "Maroubra", "Crows Nest", "North Sydney", "Chatswood", "Lane Cove", "Mosman"],
    assignmentHistory: [
      { visitId: "req-6", date: "2026-05-21", outcome: "assigned" },
      { visitId: "req-12", date: "2026-05-18", outcome: "concern_flagged" },
      { visitId: "vis-extra-1", date: "2026-05-15", outcome: "completed_ok" },
    ],
    availability: buildAvailability(
      { Mon: weekdayRange, Tue: morningOnly, Wed: weekdayRange, Thu: weekdayRange, Fri: morningOnly,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Greek"],
      hasVehicle: true,
      canAssistMobility: true,
      notes: "Former aged-care worker",
    },
  },
  {
    id: "v3",
    name: "Mei-Ling Wu",
    phone: "0422 100 003",
    districts: ["northbridge"],
    preferredDistrict: "northbridge",
    suburbRanking: ["Chatswood", "Lane Cove", "Crows Nest", "Mosman", "North Sydney", "Newtown", "Leichhardt", "Marrickville", "Bondi", "Coogee", "Randwick", "Maroubra"],
    assignmentHistory: [
      { visitId: "req-7", date: "2026-05-22", outcome: "assigned" },
      { visitId: "req-13", date: "2026-05-17", outcome: "unable_to_complete" },
      { visitId: "vis-extra-2", date: "2026-05-14", outcome: "completed_ok" },
      { visitId: "vis-extra-3", date: "2026-05-10", outcome: "completed_ok" },
    ],
    availability: buildAvailability(
      { Mon: afternoonOnly, Tue: afternoonOnly, Wed: fullDay, Thu: afternoonOnly, Fri: afternoonOnly,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Mandarin", "Cantonese"],
      hasVehicle: false,
      canAssistMobility: false,
      notes: "Uses public transport",
    },
  },
  {
    id: "v4",
    name: "David Okoye",
    phone: "0422 100 004",
    districts: ["eastside"],
    preferredDistrict: "eastside",
    suburbRanking: ["Bondi", "Coogee", "Randwick", "Maroubra", "Marrickville", "Newtown", "Leichhardt", "North Sydney", "Crows Nest", "Lane Cove", "Mosman", "Chatswood"],
    assignmentHistory: [
      { visitId: "req-8", date: "2026-05-22", outcome: "assigned" },
      { visitId: "vis-extra-4", date: "2026-05-16", outcome: "completed_ok" },
    ],
    availability: buildAvailability(
      { Mon: morningOnly, Tue: morningOnly, Wed: morningOnly, Thu: morningOnly, Fri: morningOnly,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Igbo"],
      hasVehicle: true,
      canAssistMobility: true,
      notes: "First-aid certified",
    },
  },
  {
    id: "v5",
    name: "Priya Sharma",
    phone: "0422 100 005",
    districts: ["northbridge"],
    preferredDistrict: "northbridge",
    suburbRanking: ["Crows Nest", "North Sydney", "Mosman", "Lane Cove", "Chatswood", "Newtown", "Marrickville", "Leichhardt", "Bondi", "Randwick", "Coogee", "Maroubra"],
    assignmentHistory: [
      { visitId: "req-10", date: "2026-05-22", outcome: "assigned" },
      { visitId: "vis-extra-5", date: "2026-05-13", outcome: "completed_ok" },
      { visitId: "vis-extra-6", date: "2026-05-08", outcome: "completed_ok" },
      { visitId: "vis-extra-7", date: "2026-05-05", outcome: "concern_flagged" },
      { visitId: "vis-extra-8", date: "2026-05-01", outcome: "completed_ok" },
    ],
    availability: buildAvailability(
      { Mon: weekdayRange, Tue: weekdayRange, Wed: weekdayRange, Thu: weekdayRange, Fri: weekdayRange,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Hindi"],
      hasVehicle: true,
      canAssistMobility: false,
      notes: "Prefers morning shifts",
    },
  },
  {
    id: "v6",
    name: "Tom Bradley",
    phone: "0422 100 006",
    districts: ["eastside", "westend"],
    preferredDistrict: "westend",
    suburbRanking: ["Newtown", "Marrickville", "Leichhardt", "Bondi", "Randwick", "Coogee", "Maroubra", "Crows Nest", "North Sydney", "Lane Cove", "Chatswood", "Mosman"],
    assignmentHistory: [
      { visitId: "vis-extra-9", date: "2026-05-12", outcome: "completed_ok" },
      { visitId: "vis-extra-10", date: "2026-05-09", outcome: "completed_ok" },
      { visitId: "vis-extra-11", date: "2026-05-06", outcome: "unable_to_complete" },
    ],
    availability: buildAvailability(
      { Mon: weekdayRange, Tue: weekdayRange, Wed: weekdayRange, Thu: weekdayRange, Fri: weekdayRange,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English"],
      hasVehicle: true,
      canAssistMobility: true,
      notes: "Has cargo bike for large deliveries",
    },
  },
  {
    id: "v7",
    name: "Anika Patel",
    phone: "0422 100 007",
    districts: ["westend", "northbridge"],
    preferredDistrict: "westend",
    suburbRanking: ["Marrickville", "Newtown", "Leichhardt", "Crows Nest", "Chatswood", "Lane Cove", "Mosman", "North Sydney", "Bondi", "Coogee", "Randwick", "Maroubra"],
    assignmentHistory: [
      { visitId: "vis-extra-12", date: "2026-05-11", outcome: "completed_ok" },
      { visitId: "vis-extra-13", date: "2026-05-07", outcome: "completed_ok" },
    ],
    availability: buildAvailability(
      { Mon: weekdayRange, Tue: weekdayRange, Wed: weekdayRange, Thu: weekdayRange, Fri: weekdayRange,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Hindi", "Gujarati"],
      hasVehicle: false,
      canAssistMobility: false,
      notes: "Available weekends",
    },
  },
  {
    id: "v8",
    name: "Rachel Nguyen",
    phone: "0422 100 008",
    districts: ["eastside", "westend", "northbridge"],
    preferredDistrict: "eastside",
    suburbRanking: ["Coogee", "Bondi", "Randwick", "Maroubra", "Newtown", "Leichhardt", "Marrickville", "Crows Nest", "North Sydney", "Lane Cove", "Mosman", "Chatswood"],
    assignmentHistory: [
      { visitId: "vis-extra-14", date: "2026-05-10", outcome: "completed_ok" },
      { visitId: "vis-extra-15", date: "2026-05-04", outcome: "completed_ok" },
      { visitId: "vis-extra-16", date: "2026-04-28", outcome: "concern_flagged" },
    ],
    availability: buildAvailability(
      { Mon: fullDay, Tue: fullDay, Wed: fullDay, Thu: fullDay, Fri: fullDay,
        Sat: weekendFull, Sun: weekendFull },
    ),
    characteristics: {
      languages: ["English", "Vietnamese", "Mandarin"],
      hasVehicle: true,
      canAssistMobility: true,
      notes: "Flexible schedule",
    },
  },
];
