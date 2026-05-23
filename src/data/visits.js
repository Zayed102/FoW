const today = new Date();
const d = (offsetDays) => {
  const x = new Date(today);
  x.setDate(x.getDate() + offsetDays);
  return x.toISOString().slice(0, 10);
};

export const visits = [
  {
    id: "vis-1",
    requestId: "req-5",
    volunteerId: "v1",
    requestorName: "Edna Park",
    address: "33 Marrickville Rd, Marrickville NSW 2204",
    districtId: "westend",
    mealItems: ["Pumpkin soup", "Sourdough"],
    visitDate: d(0),
    timeSlot: "10:00-11:00",
    status: "assigned",
  },
  {
    id: "vis-2",
    requestId: "req-9",
    volunteerId: "v1",
    requestorName: "Jenny Okafor",
    address: "56 Longueville Rd, Lane Cove NSW 2066",
    districtId: "northbridge",
    mealItems: ["Pasta bake", "Salad", "Water"],
    visitDate: d(0),
    timeSlot: "09:00-10:00",
    status: "ongoing",
  },
  {
    id: "vis-3",
    requestId: "req-11",
    volunteerId: "v1",
    requestorName: "Linda Rossi",
    address: "21 Anzac Pde, Maroubra NSW 2035",
    districtId: "eastside",
    mealItems: ["Shepherd's pie", "Garden salad"],
    visitDate: d(-4),
    timeSlot: "11:00-12:00",
    status: "completed",
  },
  {
    id: "vis-4",
    requestId: "req-14",
    volunteerId: "v1",
    requestorName: "Peter Amara",
    address: "100 Pacific Hwy, North Sydney NSW 2060",
    districtId: "northbridge",
    mealItems: ["Quiche", "Fruit salad"],
    visitDate: d(-6),
    timeSlot: "13:00-14:00",
    status: "cancelled",
  },
  {
    id: "vis-5",
    requestId: "req-15",
    volunteerId: "v1",
    requestorName: "Kevin Walsh",
    address: "9 Hall St, Bondi NSW 2026",
    districtId: "eastside",
    mealItems: ["Roast vegetable wrap"],
    visitDate: d(9),
    timeSlot: "12:00-13:00",
    status: "assigned",
  },
];
