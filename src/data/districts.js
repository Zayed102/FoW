export const DISTRICTS = {
  eastside: "Eastern Suburbs",
  westend: "Inner West",
  northbridge: "Lower North Shore",
};

export const SERVICING_SUBURBS = {
  eastside: ["Bondi", "Coogee", "Randwick", "Maroubra"],
  westend: ["Newtown", "Marrickville", "Leichhardt"],
  northbridge: ["Chatswood", "Crows Nest", "Lane Cove", "Mosman", "North Sydney"],
};

export const ALL_SUBURBS = Object.values(SERVICING_SUBURBS).flat();
